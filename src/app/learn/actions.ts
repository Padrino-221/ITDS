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
import { str, opt, bool } from "@/lib/form-utils";
import type { ContentBlock, QuizQuestion, ExamQuestionInput } from "@/lib/learn";
import { checkCertificateEligibilityFor } from "@/lib/learn";

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
  redirect("/staff-panel/login");
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
  const BLOCK_TYPES = new Set(["heading", "paragraph", "code", "list", "video"]);
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

/**
 * Delete a lesson. Lecturers can only delete lessons they authored, and only
 * before they are published (removing live content is an admin decision).
 * Admins can delete any lesson. Learner progress on the lesson cascades.
 */
export async function deleteLesson(lessonId: string, backTo?: string) {
  const user = await requireRole(["LECTURER", "ADMIN"], absoluteUrl("/staff-panel/login"));
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw new Error("Lesson not found.");

  if (user.role !== "ADMIN") {
    if (lesson.authorId !== user.id) {
      throw new Error("You can only delete lessons you authored.");
    }
    if (lesson.status === "PUBLISHED") {
      throw new Error("Published lessons can only be deleted by an admin.");
    }
  }

  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidateLearn();
  redirect(learnUrl(backTo ?? "/author"));
}

// ---------------------------------------------------------------------------
// Subject & topic management (admin only)
// ---------------------------------------------------------------------------

export async function createSubject(formData: FormData) {
  await requireRole(["ADMIN"], absoluteUrl("/staff-panel/login"));
  const name = str(formData, "name");
  const description = str(formData, "description");
  const certificatePriceRaw = formData.get("certificatePrice");
  const certificatePrice = certificatePriceRaw && certificatePriceRaw !== ""
    ? Math.round(Number(certificatePriceRaw) * 100) // Convert GHS to pesewas
    : null;
  if (certificatePrice !== null && certificatePrice < 100) {
    throw new Error("Certificate price must be at least GHS 1.00.");
  }
  if (name.length < 2) throw new Error("Course name is required.");

  const slug = slugify(name) || "subject";
  const existing = await prisma.subject.findUnique({ where: { slug } });
  if (existing) throw new Error("A course with this name already exists.");

  await prisma.subject.create({ data: { name, slug, description: description || null, certificatePrice } });
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
  const certificatePriceRaw = formData.get("certificatePrice");
  const certificatePrice = certificatePriceRaw && certificatePriceRaw !== ""
    ? Math.round(Number(certificatePriceRaw) * 100) // Convert GHS to pesewas
    : null;
  if (certificatePrice !== null && certificatePrice < 100) {
    throw new Error("Certificate price must be at least GHS 1.00.");
  }
  if (name.length < 2) throw new Error("Course name is required.");

  const existing = await prisma.subject.findUnique({ where: { id } });
  if (!existing) throw new Error("Course not found.");

  const slug = slugify(name) || existing.slug;
  const duplicate = await prisma.subject.findFirst({ where: { slug, NOT: { id } } });
  if (duplicate) throw new Error("A course with this name already exists.");

  await prisma.subject.update({ where: { id }, data: { name, slug, description, certificatePrice } });
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

// ---------------------------------------------------------------------------
// Exams
// ---------------------------------------------------------------------------

/** Create or update an exam for a topic. */
export async function saveExam(topicId: string, formData: FormData) {
  const user = await requireRole(["ADMIN", "LECTURER"], absoluteUrl("/staff-panel/login"));
  const title = str(formData, "title");
  if (!title) throw new Error("Exam title is required.");

  const description = opt(formData, "description");
  const timeLimitRaw = formData.get("timeLimit");
  const timeLimit = timeLimitRaw && timeLimitRaw !== "" ? Number(timeLimitRaw) : null;
  const passScore = Number(formData.get("passScore") || 70);
  const published = bool(formData, "published");
  const questionsRaw = str(formData, "questions");

  // Parse and validate questions
  let questions: ExamQuestionInput[] = [];
  try {
    const parsed = JSON.parse(questionsRaw || "[]");
    if (Array.isArray(parsed)) {
      questions = parsed.filter((q: Record<string, unknown>) =>
        q && typeof q.question === "string" && q.question.trim() &&
        typeof q.type === "string" && ["MC", "TF", "CODE"].includes(q.type as string)
      );
    }
  } catch {
    // leave empty
  }

  if (questions.length === 0) {
    throw new Error("An exam must have at least one question.");
  }

  // Upsert the exam
  const exam = await prisma.exam.upsert({
    where: { topicId },
    update: {
      title,
      description,
      timeLimit,
      passScore,
      published,
    },
    create: {
      topicId,
      title,
      description,
      timeLimit,
      passScore,
      published,
    },
  });

  // Replace all questions
  await prisma.examQuestion.deleteMany({ where: { examId: exam.id } });
  if (questions.length > 0) {
    await prisma.examQuestion.createMany({
      data: questions.map((q, i) => ({
        examId: exam.id,
        type: q.type as "MC" | "TF" | "CODE",
        question: q.question.trim(),
        options: q.type === "MC" ? (q.options ?? []) : q.type === "TF" ? ["True", "False"] : undefined,
        correctAnswer: q.correctAnswer,
        codeLanguage: q.codeLanguage || undefined,
        codeTemplate: q.codeTemplate || undefined,
        order: i,
      })),
    });
  }

  revalidateLearn();
  revalidatePath(learnUrl(`/manage`));
  redirect(learnUrl(`/manage?updated=exam`));
}

/** Delete an exam and all its questions/attempts. */
export async function deleteExam(examId: string) {
  await requireRole(["ADMIN"], absoluteUrl("/staff-panel/login"));
  await prisma.exam.delete({ where: { id: examId } });
  revalidateLearn();
  revalidatePath(learnUrl(`/manage`));
  redirect(learnUrl(`/manage?deleted=exam`));
}

// ---------------------------------------------------------------------------
// Exam taking (learner)
// ---------------------------------------------------------------------------

/** Start a new exam attempt. */
export async function startExamAttempt(examId: string) {
  const learner = await requireLearner();
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || !exam.published) throw new Error("Exam not found.");

  // Rate limit: max 5 new attempts per hour per learner per exam
  if (!rateLimit(`exam:${examId}:${learner.id}`, 5, 60 * 60 * 1000)) {
    throw new Error("Too many exam attempts. Please try again later.");
  }

  // Check if learner has an in-progress attempt (started but not completed)
  const inProgress = await prisma.examAttempt.findFirst({
    where: {
      examId,
      learnerId: learner.id,
      completedAt: null,
    },
  });

  if (inProgress) return { attemptId: inProgress.id, startedAt: inProgress.startedAt.toISOString() };

  // Create new attempt
  const attempt = await prisma.examAttempt.create({
    data: {
      examId,
      learnerId: learner.id,
      answers: [],
    },
  });

  return { attemptId: attempt.id, startedAt: attempt.startedAt.toISOString() };
}

/** Submit exam answers and auto-grade. */
export async function submitExamAttempt(attemptId: string, formData: FormData) {
  const learner = await requireLearner();
  const answersRaw = str(formData, "answers");
  const timeSpentRaw = formData.get("timeSpent");
  const timeSpent = timeSpentRaw ? Number(timeSpentRaw) : null;

  // Verify the attempt belongs to this learner and is not yet completed
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: { exam: { include: { questions: true } } },
  });
  if (!attempt) throw new Error("Attempt not found.");
  if (attempt.learnerId !== learner.id) throw new Error("Unauthorized.");
  if (attempt.completedAt) throw new Error("Attempt already completed.");

  // Parse answers
  let answers: Array<{ questionId: string; answer: string }> = [];
  try {
    const parsed = JSON.parse(answersRaw || "[]");
    if (Array.isArray(parsed)) answers = parsed;
  } catch {
    // leave empty
  }

  // Auto-grade
  const questions = attempt.exam.questions;
  const gradedAnswers = answers.map((a) => {
    const q = questions.find((qq) => qq.id === a.questionId);
    if (!q) return { ...a, correct: false };

    let isCorrect = false;
    if (q.type === "MC") {
      // correctAnswer is the index as string
      isCorrect = a.answer === q.correctAnswer;
    } else if (q.type === "TF") {
      isCorrect = a.answer === q.correctAnswer;
    }
    // CODE answers are graded separately (via Piston) — mark as ungraded for now

    return { ...a, correct: isCorrect };
  });

  // Calculate score (only MC + TF count toward score for now)
  const scorableQuestions = questions.filter((q) => q.type === "MC" || q.type === "TF");
  const scorableAnswers = gradedAnswers.filter((a) => {
    const q = questions.find((qq) => qq.id === a.questionId);
    return q && (q.type === "MC" || q.type === "TF");
  });
  const score = scorableQuestions.length > 0
    ? Math.round((scorableAnswers.filter((a) => a.correct).length / scorableQuestions.length) * 100)
    : 0;
  const passed = score >= attempt.exam.passScore;

  await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      answers: gradedAnswers,
      score,
      passed,
      completedAt: new Date(),
      timeSpent,
    },
  });

  return { score, passed, total: scorableQuestions.length, correct: scorableAnswers.filter((a) => a.correct).length };
}

// ---------------------------------------------------------------------------
// Certificates
// ---------------------------------------------------------------------------

import {
  initializeTransaction,
  verifyTransaction,
  generateCertificateNo,
} from "@/lib/paystack";

/** Check if a learner is eligible for a certificate (all lessons completed). */
export async function checkCertificateEligibility(subjectId: string) {
  const learner = await requireLearner();
  return checkCertificateEligibilityFor(learner.id, subjectId);
}

/** Initialize a certificate payment via Paystack. */
export async function initiateCertificatePayment(subjectId: string) {
  const learner = await requireLearner();

  // Check eligibility
  const eligibility = await checkCertificateEligibility(subjectId);
  if (eligibility.hasCertificate) {
    throw new Error("You already have a certificate for this course.");
  }
  if (!eligibility.eligible) {
    throw new Error(eligibility.reason ?? "Not eligible for certificate.");
  }

  // Get subject price
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) throw new Error("Course not found.");
  if (!subject.certificatePrice) throw new Error("Certificates are not available for this course.");

  // Initialize Paystack transaction
  const reference = `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const transaction = await initializeTransaction({
    email: learner.email,
    amount: subject.certificatePrice, // Already in GHS pesewas
    reference,
    metadata: {
      learnerId: learner.id,
      subjectId,
      learnerName: learner.name,
      subjectName: subject.name,
      type: "certificate",
    },
  });

  return { authorizationUrl: transaction.authorization_url, reference };
}

/** Verify payment and issue certificate. */
export async function verifyCertificatePayment(reference: string) {
  const learner = await requireLearner();

  // Verify with Paystack
  const verification = await verifyTransaction(reference);
  if (verification.status !== "success") {
    throw new Error("Payment was not successful.");
  }

  const metadata = verification.metadata as {
    learnerId?: string;
    subjectId?: string;
  };

  if (metadata.learnerId !== learner.id) {
    throw new Error("Payment does not belong to this user.");
  }

  if (!metadata.subjectId) throw new Error("Invalid payment metadata.");

  // Check if certificate already exists
  const existing = await prisma.certificate.findUnique({
    where: { learnerId_subjectId: { learnerId: learner.id, subjectId: metadata.subjectId } },
  });
  if (existing) return existing;

  // Get subject for certificate number
  const subject = await prisma.subject.findUnique({ where: { id: metadata.subjectId } });
  if (!subject) throw new Error("Course not found.");

  // Issue certificate — handle race condition with webhook
  const certificateNo = generateCertificateNo(subject.slug);
  try {
    const certificate = await prisma.certificate.create({
      data: {
        learnerId: learner.id,
        subjectId: metadata.subjectId,
        paystackRef: reference,
        amountPaid: verification.amount,
        certificateNo,
      },
    });

    // Send certificate email notification
    sendCertificateEmail(learner.email, learner.name, subject.name, certificateNo, certificate.id).catch(
      (err) => console.error("Failed to send certificate email:", err)
    );

    return certificate;
  } catch (err: unknown) {
    // Unique constraint violation means the webhook already created it — return the existing one.
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      const existing = await prisma.certificate.findUnique({
        where: { learnerId_subjectId: { learnerId: learner.id, subjectId: metadata.subjectId } },
      });
      if (existing) return existing;
    }
    throw err;
  }
}

/** Get a learner's certificates. */
export async function getMyCertificates() {
  const learner = await requireLearner();
  return prisma.certificate.findMany({
    where: { learnerId: learner.id },
    include: { subject: { select: { name: true, slug: true } } },
    orderBy: { issuedAt: "desc" },
  });
}

/** Send a certificate-issued email via Resend (fire-and-forget). */
async function sendCertificateEmail(
  email: string,
  learnerName: string,
  subjectName: string,
  certificateNo: string,
  certificateId: string
) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://itdsuenr.com";

  await resend.emails.send({
    from: process.env.RESEND_EMAIL_FROM ?? "ITDS E-Learning <onboarding@resend.dev>",
    to: email,
    subject: `Your Certificate for ${subjectName} is Ready!`,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;background-color:#f4f6fb;padding:32px 16px">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e7f0">
    <h1 style="margin:0 0 12px;font-size:20px;color:#0d3b2e">Certificate Issued!</h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#5a6a8a">
      Congratulations, ${learnerName}! Your certificate for <strong>${subjectName}</strong> has been issued.
    </p>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:16px;border:1px solid #e5e7eb">
      <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600">Certificate Number</p>
      <p style="margin:0;font-size:14px;color:#1a1a2e;font-family:monospace">${certificateNo}</p>
    </div>
      <a href="${siteUrl}/learn/certificate/${certificateId}" style="display:inline-block;background-color:#0d3b2e;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">View Your Certificate</a>
      <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#5a6a8a">
        Employers can verify this certificate anytime at
        ${siteUrl}/learn/verify?no=${certificateNo}
      </p>
      <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#9aa7c2">
        This certificate was issued by the Department of Information Technology and Decision Sciences, UENR.
      </p>
  </div>
</div>`,
  });
}

