import { cache } from "react";
import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";
import type { LessonStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// Content types (stored as JSON on the Lesson model)
// ---------------------------------------------------------------------------

export type ContentBlock =
  | { type: "heading"; text: string; level?: 2 | 3 }
  | { type: "paragraph"; text: string }
  | { type: "code"; code: string; language?: string }
  | { type: "list"; items: string[] };

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number; // index of the correct option
};

export type LessonContent = {
  objective: string;
  contentBody: ContentBlock[];
  hasPlayground: boolean;
  playgroundLang: string | null;
  starterCode: string | null;
  exercisePrompt: string | null;
  quiz: QuizQuestion[] | null;
};

type LessonLike = {
  status: LessonStatus;
  objective: string;
  contentBody: unknown;
  hasPlayground: boolean;
  playgroundLang: string | null;
  starterCode: string | null;
  exercisePrompt: string | null;
  quiz: unknown;
  publishedSnapshot: unknown;
};

/**
 * The content students should see for a lesson. When a published lesson is
 * being revised (spec §5.5), the working fields hold the draft while
 * `publishedSnapshot` holds the live version — so public pages must render
 * the snapshot, never the working draft.
 */
export function resolvePublishedContent(lesson: LessonLike): LessonContent {
  if (lesson.status === "PUBLISHED") {
    return {
      objective: lesson.objective,
      contentBody: (lesson.contentBody ?? []) as ContentBlock[],
      hasPlayground: lesson.hasPlayground,
      playgroundLang: lesson.playgroundLang,
      starterCode: lesson.starterCode,
      exercisePrompt: lesson.exercisePrompt,
      quiz: (lesson.quiz ?? null) as QuizQuestion[] | null,
    };
  }
  const snap = (lesson.publishedSnapshot ?? null) as Partial<LessonContent> | null;
  return {
    objective: snap?.objective ?? lesson.objective,
    contentBody: (snap?.contentBody ?? []) as ContentBlock[],
    hasPlayground: snap?.hasPlayground ?? false,
    playgroundLang: snap?.playgroundLang ?? lesson.playgroundLang,
    starterCode: snap?.starterCode ?? lesson.starterCode,
    exercisePrompt: snap?.exercisePrompt ?? lesson.exercisePrompt,
    quiz: (snap?.quiz ?? lesson.quiz ?? null) as QuizQuestion[] | null,
  };
}

export const LESSON_STATUS_LABEL: Record<LessonStatus, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In Review",
  CHANGES_REQUESTED: "Changes Requested",
  PUBLISHED: "Published",
};

export const LESSON_STATUS_TONE: Record<LessonStatus, string> = {
  DRAFT: "bg-stone-100 text-stone-600",
  IN_REVIEW: "bg-gold-50 text-gold-600",
  CHANGES_REQUESTED: "bg-red-50 text-red-600",
  PUBLISHED: "bg-emerald-50 text-emerald-700",
};

// A lesson is publicly visible when it is published, or when a published
// version exists as a snapshot (i.e. it is mid-revision).
const PUBLIC_LESSON_WHERE: Prisma.LessonWhereInput = {
  OR: [{ status: "PUBLISHED" }, { publishedSnapshot: { not: Prisma.DbNull } }],
};

// ---------------------------------------------------------------------------
// Public queries
// ---------------------------------------------------------------------------

export const getSubjects = cache(async () =>
  prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { topics: true } } },
  })
);

export const getSubjectWithTopics = cache(async (slug: string) =>
  prisma.subject.findUnique({
    where: { slug },
    include: {
      topics: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: PUBLIC_LESSON_WHERE,
            orderBy: { order: "asc" },
            select: { id: true, slug: true, title: true, order: true, status: true },
          },
        },
      },
    },
  })
);

const lessonSidebarSelect = {
  id: true,
  slug: true,
  title: true,
  order: true,
  status: true,
} as const;

export const getPublicLesson = cache(
  async (subjectSlug: string, topicSlug: string, lessonSlug: string) =>
    prisma.lesson.findFirst({
      where: {
        slug: lessonSlug,
        topic: { slug: topicSlug, subject: { slug: subjectSlug } },
        ...PUBLIC_LESSON_WHERE,
      },
      include: {
        topic: {
          include: {
            subject: true,
            lessons: {
              where: PUBLIC_LESSON_WHERE,
              orderBy: { order: "asc" },
              select: lessonSidebarSelect,
            },
          },
        },
      },
    })
);

// ---------------------------------------------------------------------------
// Authoring / review queries
// ---------------------------------------------------------------------------

export const getLessonForAuthor = cache(async (id: string) =>
  prisma.lesson.findUnique({
    where: { id },
    include: {
      topic: { include: { subject: true } },
      author: { select: { id: true, name: true } },
    },
  })
);

export const getMyLessons = cache(async (authorId: string) =>
  prisma.lesson.findMany({
    where: { authorId },
    orderBy: { updatedAt: "desc" },
    include: { topic: { include: { subject: true } } },
  })
);

export const getReviewQueue = cache(async () =>
  prisma.lesson.findMany({
    where: { status: "IN_REVIEW" },
    orderBy: { updatedAt: "desc" },
    include: {
      topic: { include: { subject: true } },
      author: { select: { id: true, name: true } },
    },
  })
);

export const getSubjectsWithTopics = cache(async () =>
  prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: { topics: { orderBy: { order: "asc" } } },
  })
);

// ---------------------------------------------------------------------------
// Student progress
// ---------------------------------------------------------------------------

export const getCompletedLessonIds = cache(async (userId: string) =>
  prisma.userProgress
    .findMany({ where: { userId, completed: true }, select: { lessonId: true } })
    .then((rows) => new Set(rows.map((r) => r.lessonId)))
);

export const getMyProgress = cache(async (userId: string) =>
  prisma.userProgress.findMany({
    where: { userId, completed: true },
    orderBy: { completedAt: "desc" },
    include: { lesson: { include: { topic: { include: { subject: true } } } } },
  })
);
