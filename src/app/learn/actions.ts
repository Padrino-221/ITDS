"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  authenticate,
  createSession,
  destroySession,
  hashPassword,
  requireRole,
} from "@/lib/auth";
import type { SessionRole } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import type { ContentBlock, QuizQuestion } from "@/lib/learn";

const AUTHOR_ROLES: SessionRole[] = ["LECTURER", "EDITOR", "ADMIN"];
const ADMIN_ROLES: SessionRole[] = ["ADMIN"];

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function opt(formData: FormData, key: string): string | null {
  const value = str(formData, key);
  return value ? value : null;
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

function revalidateLearn() {
  revalidatePath("/learn", "layout");
  revalidatePath("/", "layout");
}

/** Author or admin — and only the lesson's own author unless admin. */
async function authorGuard(lessonId: string) {
  const user = await requireRole(AUTHOR_ROLES);
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, authorId: true, status: true },
  });
  if (!lesson) throw new Error("Lesson not found.");
  if (lesson.authorId !== user.id && user.role !== "ADMIN") {
    throw new Error("You can only edit your own lessons.");
  }
  if (lesson.status === "IN_REVIEW") {
    throw new Error("This lesson is awaiting review and cannot be edited.");
  }
  return { user, lesson };
}

// ---------------------------------------------------------------------------
// Student accounts
// ---------------------------------------------------------------------------

export async function register(prev: { error?: string }, formData: FormData) {
  const name = str(formData, "name");
  const email = str(formData, "email");
  const password = str(formData, "password");

  if (name.length < 2) return { error: "Please enter your full name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return { error: "An account with this email already exists." };

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      role: Role.STUDENT,
    },
  });
  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  redirect("/learn/account");
}

export async function signin(prev: { error?: string }, formData: FormData) {
  const email = str(formData, "email");
  const password = str(formData, "password");

  const user = await authenticate(email, password);
  if (!user) return { error: "Invalid email or password." };
  // This sign-in is for learners. Staff and lecturers use the Staff Panel
  // sign-in (/staff-panel/login) — the same session then unlocks /learn/author.
  if (user.role !== "STUDENT") {
    return {
      error: "This sign-in is for learners. Staff and lecturers sign in from the Staff Panel.",
    };
  }
  await createSession(user);
  redirect("/learn/account");
}

export async function signout() {
  await destroySession();
  redirect("/learn");
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export async function toggleLessonComplete(lessonId: string) {
  const user = await requireRole(
    ["STUDENT", "LECTURER", "EDITOR", "ADMIN"],
    "/learn/account/signin"
  );
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
  if (!lesson) throw new Error("Lesson not found.");

  const existing = await prisma.userProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId } },
  });
  if (existing) {
    await prisma.userProgress.update({
      where: { id: existing.id },
      data: { completed: !existing.completed, completedAt: existing.completed ? null : new Date() },
    });
  } else {
    await prisma.userProgress.create({
      data: { userId: user.id, lessonId, completed: true, completedAt: new Date() },
    });
  }
  revalidateLearn();
}

// ---------------------------------------------------------------------------
// Authoring
// ---------------------------------------------------------------------------

export async function createLesson(formData: FormData) {
  const user = await requireRole(AUTHOR_ROLES);
  const topicId = str(formData, "topicId");
  const title = str(formData, "title");

  if (!topicId) throw new Error("Choose a topic for the lesson.");
  if (title.length < 3) throw new Error("Lesson title must be at least 3 characters.");

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) throw new Error("Topic not found.");

  const base = slugify(title) || "lesson";
  let slug = base;
  let n = 2;
  while (await prisma.lesson.findFirst({ where: { topicId, slug } })) {
    slug = `${base}-${n++}`;
  }
  const order = (await prisma.lesson.count({ where: { topicId } })) + 1;

  const lesson = await prisma.lesson.create({
    data: { topicId, title, slug, order, authorId: user.id, status: "DRAFT" },
  });
  redirect(`/learn/author/${lesson.id}/edit`);
}

const lessonSchema = z.object({
  title: z.string().min(3, "Lesson title must be at least 3 characters."),
  objective: z.string().min(1, "Learning objective is required."),
  exercisePrompt: z.string().optional(),
  playgroundLang: z.string().optional(),
  starterCode: z.string().optional(),
  contentBody: z.string(),
  quiz: z.string(),
});

export async function saveLesson(lessonId: string, formData: FormData) {
  const { lesson } = await authorGuard(lessonId);

  const parsed = lessonSchema.safeParse({
    title: str(formData, "title"),
    objective: str(formData, "objective"),
    exercisePrompt: opt(formData, "exercisePrompt") ?? undefined,
    playgroundLang: opt(formData, "playgroundLang") ?? undefined,
    starterCode: str(formData, "starterCode") || undefined,
    contentBody: str(formData, "contentBody"),
    quiz: str(formData, "quiz"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  // Keep only well-formed blocks (unknown shapes are dropped at render anyway,
  // but sanitizing here keeps the stored JSON tidy and predictable).
  const BLOCK_TYPES = new Set(["heading", "paragraph", "code", "list"]);
  let contentBody: ContentBlock[] = [];
  try {
    const body = JSON.parse(parsed.data.contentBody || "[]");
    if (Array.isArray(body)) {
      contentBody = (body as Array<Record<string, unknown>>).filter(
        (b): b is ContentBlock =>
          !!b && typeof b === "object" && typeof (b as ContentBlock).type === "string" &&
          BLOCK_TYPES.has((b as ContentBlock).type)
      );
    }
  } catch {
    // leave empty — the editor always submits valid JSON
  }

  // Keep only well-formed questions with an in-range correct answer.
  let quiz: QuizQuestion[] | null = null;
  try {
    const q = JSON.parse(parsed.data.quiz || "null");
    if (Array.isArray(q)) {
      quiz = (q as Array<Record<string, unknown>>).filter(
        (qq): qq is QuizQuestion =>
          !!qq &&
          typeof qq.question === "string" &&
          Array.isArray(qq.options) &&
          qq.options.length >= 2 &&
          qq.options.every((o) => typeof o === "string") &&
          typeof qq.answer === "number" &&
          qq.answer >= 0 &&
          qq.answer < qq.options.length
      );
      if (quiz.length === 0) quiz = null;
    }
  } catch {
    quiz = null;
  }

  const submitting = bool(formData, "submitReview");

  const data: Prisma.LessonUpdateInput = {
    title: parsed.data.title,
    objective: parsed.data.objective,
    contentBody,
    hasPlayground: bool(formData, "hasPlayground"),
    playgroundLang: parsed.data.playgroundLang || null,
    starterCode: parsed.data.starterCode || null,
    exercisePrompt: parsed.data.exercisePrompt || null,
    quiz: quiz === null ? Prisma.JsonNull : quiz,
  };

  if (lesson.status === "PUBLISHED") {
    // Starting a revision of a live lesson: capture the live content so the
    // public page keeps showing it while the draft is being worked on.
    const current = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (current && !current.publishedSnapshot) {
      data.publishedSnapshot = {
        objective: current.objective,
        contentBody: current.contentBody,
        hasPlayground: current.hasPlayground,
        playgroundLang: current.playgroundLang,
        starterCode: current.starterCode,
        exercisePrompt: current.exercisePrompt,
        quiz: current.quiz ?? null,
      };
    }
    data.status = "DRAFT";
  }

  if (submitting) {
    data.status = "IN_REVIEW";
    data.reviewNote = null;
  }

  await prisma.lesson.update({ where: { id: lessonId }, data });
  revalidateLearn();
  if (submitting) {
    redirect("/learn/author?submitted=1");
  }
  redirect(`/learn/author/${lessonId}/edit?saved=1`);
}

// ---------------------------------------------------------------------------
// Review (admin only)
// ---------------------------------------------------------------------------

export async function approveLesson(lessonId: string) {
  const reviewer = await requireRole(ADMIN_ROLES);
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson || lesson.status !== "IN_REVIEW") throw new Error("Lesson is not in review.");
  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      status: "PUBLISHED",
      reviewerId: reviewer.id,
      reviewNote: null,
      publishedSnapshot: Prisma.DbNull,
    },
  });
  revalidateLearn();
  redirect("/learn/review?done=1");
}

export async function requestChanges(lessonId: string, formData: FormData) {
  const reviewer = await requireRole(ADMIN_ROLES);
  const note = str(formData, "reviewNote");
  if (!note) throw new Error("Add a note explaining the changes you want.");

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson || lesson.status !== "IN_REVIEW") throw new Error("Lesson is not in review.");
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { status: "CHANGES_REQUESTED", reviewerId: reviewer.id, reviewNote: note },
  });
  revalidateLearn();
  redirect("/learn/review?done=1");
}

// ---------------------------------------------------------------------------
// Subject & topic management (admin only)
// ---------------------------------------------------------------------------

export async function createSubject(formData: FormData) {
  await requireRole(ADMIN_ROLES);
  const name = str(formData, "name");
  const description = str(formData, "description");
  if (name.length < 2) throw new Error("Subject name is required.");

  const slug = slugify(name) || "subject";
  const existing = await prisma.subject.findUnique({ where: { slug } });
  if (existing) throw new Error("A subject with this name already exists.");

  await prisma.subject.create({ data: { name, slug, description: description || null } });
  revalidateLearn();
  redirect("/learn/review?created=subject");
}

export async function createTopic(formData: FormData) {
  await requireRole(ADMIN_ROLES);
  const subjectId = str(formData, "subjectId");
  const title = str(formData, "title");
  const order = Number(formData.get("order") ?? 0) || 0;
  if (!subjectId || title.length < 2) {
    throw new Error("Choose a subject and enter a topic title.");
  }

  const slug = slugify(title) || "topic";
  const existing = await prisma.topic.findFirst({ where: { subjectId, slug } });
  if (existing) throw new Error("A topic with this name already exists in this subject.");

  await prisma.topic.create({ data: { subjectId, title, slug, order } });
  revalidateLearn();
  redirect("/learn/review?created=topic");
}
