"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authenticate, createSession, destroySession, requireRole } from "@/lib/auth";
import {
  authenticateLearner,
  createLearnerSession,
  destroyLearnerSession,
  getLearnerSession,
  hashPassword,
  requireLearner,
} from "@/lib/learn-auth";
import { absoluteUrl, slugify, learnUrl } from "@/lib/utils";
import type { ContentBlock, QuizQuestion } from "@/lib/learn";

// ---------------------------------------------------------------------------
// Auth rate limiting (in-memory sliding window — fine for a single instance)
// ---------------------------------------------------------------------------

const buckets = new Map<string, number[]>();

function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}

async function clientIp(): Promise<string> {
  const fwd = (await headers()).get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}

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

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export async function register(prev: { error?: string }, formData: FormData) {
  const name = str(formData, "name");
  const email = str(formData, "email");
  const password = str(formData, "password");

  // Validate before rate-limiting so invalid submissions can't lock an email.
  if (name.length < 2) return { error: "Please enter your full name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  // Slow down automated account creation.
  if (!rateLimit(`register:${email.toLowerCase()}`, 3, 10 * 60 * 1000)) {
    return { error: "Too many attempts for this email. Try again later." };
  }
  if (!rateLimit(`register-ip:${await clientIp()}`, 10, 10 * 60 * 1000)) {
    return { error: "Too many sign-ups from this connection. Try again later." };
  }

  const existing = await prisma.learner.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) return { error: "An account with this email already exists." };

  const learner = await prisma.learner.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
    },
  });
  await createLearnerSession({ id: learner.id, name: learner.name, email: learner.email });
  redirect(learnUrl("/account"));
}

export async function signin(prev: { error?: string }, formData: FormData) {
  const email = str(formData, "email");
  const password = str(formData, "password");

  // Slow down credential stuffing against known accounts.
  if (!rateLimit(`signin:${email.toLowerCase()}`, 8, 10 * 60 * 1000)) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }
  if (!rateLimit(`signin-ip:${await clientIp()}`, 20, 10 * 60 * 1000)) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const learner = await authenticateLearner(email, password);
  if (learner) {
    await createLearnerSession(learner);
    redirect(learnUrl("/account"));
  }

  // Not a learner — try the staff accounts so lecturers (and editors/admins)
  // can sign in from the Hub too. They get the staff session cookie instead
  // of a learner one. Lecturers go straight to their author dashboard.
  const staff = await authenticate(email, password);
  if (!staff) return { error: "Invalid email or password." };
  await createSession(staff);
  redirect(learnUrl(staff.role === "LECTURER" ? "/author" : "/"));
}

export async function signout() {
  await destroyLearnerSession();
  redirect(learnUrl("/"));
}

/**
 * Sign out of the Staff Panel session from the /learn header. Staff accounts
 * (lecturers, editors, admins) are sent back to the staff login on the main
 * site; learner sessions are a separate cookie and are unaffected.
 */
export async function staffSignout() {
  await destroySession();
  redirect(absoluteUrl("/staff-panel/login"));
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export async function toggleLessonComplete(lessonId: string) {
  const learner = await requireLearner();
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
  if (!lesson) throw new Error("Lesson not found.");

  const existing = await prisma.userProgress.findUnique({
    where: { learnerId_lessonId: { learnerId: learner.id, lessonId } },
  });
  if (existing) {
    await prisma.userProgress.update({
      where: { id: existing.id },
      data: { completed: !existing.completed, completedAt: existing.completed ? null : new Date() },
    });
  } else {
    await prisma.userProgress.create({
      data: { learnerId: learner.id, lessonId, completed: true, completedAt: new Date() },
    });
  }
  revalidateLearn();
}

/**
 * Record a self-graded quiz attempt. Keeps the best score per learner+lesson.
 * Anonymous learners are silently skipped (the quiz is still self-graded
 * in the browser either way).
 */
export async function saveQuizScore(lessonId: string, score: number, total: number) {
  const learner = await getLearnerSession();
  if (!learner) return;
  if (!Number.isInteger(score) || !Number.isInteger(total) || total < 1 || score < 0 || score > total) {
    return;
  }
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
  if (!lesson) return;

  const existing = await prisma.userProgress.findUnique({
    where: { learnerId_lessonId: { learnerId: learner.id, lessonId } },
  });
  if (existing) {
    await prisma.userProgress.update({
      where: { id: existing.id },
      data: {
        bestScore:
          existing.bestScore == null || score > existing.bestScore ? score : existing.bestScore,
        bestScoreTotal:
          existing.bestScore == null || score > existing.bestScore
            ? total
            : existing.bestScoreTotal,
        attemptCount: { increment: 1 },
        lastAttemptAt: new Date(),
      },
    });
  } else {
    await prisma.userProgress.create({
      data: {
        learnerId: learner.id,
        lessonId,
        completed: false,
        bestScore: score,
        bestScoreTotal: total,
        attemptCount: 1,
        lastAttemptAt: new Date(),
      },
    });
  }
  // Only the learner's dashboard changes — no need to bust every static lesson.
  revalidatePath("/learn/account");
}

// ---------------------------------------------------------------------------
// Authoring (staff accounts — lecturers, editors and admins)
// ---------------------------------------------------------------------------

const AUTHOR_ROLES = ["LECTURER", "ADMIN"] as const;
const AUTHOR_LOGIN = absoluteUrl("/staff-panel/login");

/** Author or admin — and only the lesson's own author unless admin. */
async function authorGuard(lessonId: string) {
  const user = await requireRole([...AUTHOR_ROLES], AUTHOR_LOGIN);
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

export async function createLesson(formData: FormData) {
  const user = await requireRole([...AUTHOR_ROLES], AUTHOR_LOGIN);
  const subjectId = str(formData, "subjectId");
  const topicTitle = str(formData, "topicTitle");
  const title = str(formData, "title");

  if (!subjectId) throw new Error("Choose a course for the lesson.");
  if (topicTitle.length < 2) throw new Error("Topic title is required.");
  if (title.length < 3) throw new Error("Lesson title must be at least 3 characters.");

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) throw new Error("Course not found.");

  const topicSlug = slugify(topicTitle) || "topic";
  let topic = await prisma.topic.findFirst({ where: { subjectId, slug: topicSlug } });
  if (!topic) {
    const count = await prisma.topic.count({ where: { subjectId } });
    topic = await prisma.topic.create({
      data: { subjectId, title: topicTitle, slug: topicSlug, order: count },
    });
  }

  const base = slugify(title) || "lesson";
  let slug = base;
  let n = 2;
  while (await prisma.lesson.findFirst({ where: { topicId: topic.id, slug } })) {
    slug = `${base}-${n++}`;
  }
  const order = (await prisma.lesson.count({ where: { topicId: topic.id } })) + 1;

  const lesson = await prisma.lesson.create({
    data: { topicId: topic.id, title, slug, order, authorId: user.id, status: "DRAFT" },
  });
  redirect(learnUrl(`/author/${lesson.id}/edit`));
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
          !!b &&
          typeof b === "object" &&
          typeof (b as ContentBlock).type === "string" &&
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
    redirect(learnUrl("/author?submitted=1"));
  }
  redirect(learnUrl(`/author/${lessonId}/edit?saved=1`));
}

// ---------------------------------------------------------------------------
// Review (admin only)
// ---------------------------------------------------------------------------

export async function approveLesson(lessonId: string) {
  const reviewer = await requireRole(["ADMIN"], absoluteUrl("/staff-panel/login"));
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
  redirect(learnUrl("/review?done=1"));
}

export async function requestChanges(lessonId: string, formData: FormData) {
  const reviewer = await requireRole(["ADMIN"], absoluteUrl("/staff-panel/login"));
  const note = str(formData, "reviewNote");
  if (!note) throw new Error("Add a note explaining the changes you want.");

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson || lesson.status !== "IN_REVIEW") throw new Error("Lesson is not in review.");
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { status: "CHANGES_REQUESTED", reviewerId: reviewer.id, reviewNote: note },
  });
  revalidateLearn();
  redirect(learnUrl("/review?done=1"));
}

// ---------------------------------------------------------------------------
// Subject & topic management (admin only)
// ---------------------------------------------------------------------------

export async function createSubject(formData: FormData) {
  await requireRole(["ADMIN"], absoluteUrl("/staff-panel/login"));
  const name = str(formData, "name");
  const description = str(formData, "description");
  if (name.length < 2) throw new Error("Course name is required.");

  const slug = slugify(name) || "subject";
  const existing = await prisma.subject.findUnique({ where: { slug } });
  if (existing) throw new Error("A course with this name already exists.");

  await prisma.subject.create({ data: { name, slug, description: description || null } });
  revalidateLearn();
  redirect(learnUrl("/manage?created=subject"));
}

export async function createTopic(formData: FormData) {
  await requireRole(["ADMIN"], absoluteUrl("/staff-panel/login"));
  const subjectId = str(formData, "subjectId");
  const title = str(formData, "title");
  const order = Number(formData.get("order") ?? 0) || 0;
  if (!subjectId || title.length < 2) {
    throw new Error("Choose a course and enter a topic title.");
  }

  const slug = slugify(title) || "topic";
  const existing = await prisma.topic.findFirst({ where: { subjectId, slug } });
  if (existing) throw new Error("A topic with this name already exists in this course.");

  await prisma.topic.create({ data: { subjectId, title, slug, order } });
  revalidateLearn();
  redirect(learnUrl("/manage?created=topic"));
}

export async function updateSubject(formData: FormData) {
  await requireRole(["ADMIN"], absoluteUrl("/staff-panel/login"));
  const id = str(formData, "subjectId");
  const name = str(formData, "name");
  const description = opt(formData, "description");
  if (name.length < 2) throw new Error("Course name is required.");

  const existing = await prisma.subject.findUnique({ where: { id } });
  if (!existing) throw new Error("Course not found.");

  const slug = slugify(name) || existing.slug;
  const duplicate = await prisma.subject.findFirst({ where: { slug, NOT: { id } } });
  if (duplicate) throw new Error("A course with this name already exists.");

  await prisma.subject.update({ where: { id }, data: { name, slug, description } });
  revalidateLearn();
  redirect(learnUrl("/manage?updated=subject"));
}

export async function deleteSubject(subjectId: string) {
  await requireRole(["ADMIN"], absoluteUrl("/staff-panel/login"));
  const topicCount = await prisma.topic.count({ where: { subjectId } });
  if (topicCount > 0) {
    throw new Error(
      `This course still has ${topicCount} topic${topicCount === 1 ? "" : "s"}. Delete those first.`
    );
  }
  await prisma.subject.delete({ where: { id: subjectId } });
  revalidateLearn();
  redirect(learnUrl("/manage?deleted=subject"));
}

export async function updateTopic(formData: FormData) {
  await requireRole(["ADMIN"], absoluteUrl("/staff-panel/login"));
  const id = str(formData, "topicId");
  const subjectId = str(formData, "subjectId");
  const title = str(formData, "title");
  const order = Number(formData.get("order") ?? 0) || 0;
  if (!subjectId || title.length < 2) throw new Error("Choose a course and enter a topic title.");

  const existing = await prisma.topic.findUnique({ where: { id } });
  if (!existing) throw new Error("Topic not found.");

  const slug = slugify(title) || existing.slug;
  const duplicate = await prisma.topic.findFirst({
    where: { subjectId, slug, NOT: { id } },
  });
  if (duplicate) throw new Error("A topic with this title already exists in this course.");

  await prisma.topic.update({ where: { id }, data: { title, slug, order, subjectId } });
  revalidateLearn();
  redirect(learnUrl("/manage?updated=topic"));
}

export async function deleteTopic(topicId: string) {
  await requireRole(["ADMIN"], absoluteUrl("/staff-panel/login"));
  const lessonCount = await prisma.lesson.count({ where: { topicId } });
  if (lessonCount > 0) {
    throw new Error(
      `This topic still has ${lessonCount} lesson${lessonCount === 1 ? "" : "s"}. Delete those first.`
    );
  }
  await prisma.topic.delete({ where: { id: topicId } });
  revalidateLearn();
  redirect(learnUrl("/manage?deleted=topic"));
}

