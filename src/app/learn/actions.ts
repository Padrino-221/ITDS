"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  authenticate,
  createSession,
  destroySession,
  getLearnerSession,
  hashPassword,
  requireLearner,
  requireRole,
} from "@/lib/auth";
import type { SessionRole } from "@/lib/auth";
import { slugify, learnUrl } from "@/lib/utils";

const ADMIN_ROLES: SessionRole[] = ["ADMIN"];

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

  const user = await authenticate(email, password);
  if (!user) return { error: "Invalid email or password." };
  if (user.role !== "STUDENT") {
    return {
      error: "This sign-in is for learners. Staff and lecturers sign in from the Staff Panel.",
    };
  }
  await createSession(user);
  redirect(learnUrl("/account"));
}

export async function signout() {
  await destroySession();
  redirect(learnUrl("/"));
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export async function toggleLessonComplete(lessonId: string) {
  const user = await requireLearner();
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

/**
 * Record a self-graded quiz attempt. Keeps the best score per user+lesson.
 * Anonymous learners are silently skipped (the quiz is still self-graded
 * in the browser either way).
 */
export async function saveQuizScore(lessonId: string, score: number, total: number) {
  const user = await getLearnerSession();
  if (!user) return;
  if (!Number.isInteger(score) || !Number.isInteger(total) || total < 1 || score < 0 || score > total) {
    return;
  }
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
  if (!lesson) return;

  const existing = await prisma.userProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId } },
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
        userId: user.id,
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
  redirect(learnUrl("/review?done=1"));
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
  redirect(learnUrl("/review?done=1"));
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
  redirect(learnUrl("/review?created=subject"));
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
  redirect(learnUrl("/review?created=topic"));
}

