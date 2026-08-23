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
  | { type: "list"; items: string[] }
  | { type: "video"; url: string };

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

/** Coerce a JSON column that may be `{}`, a string, or null into an array. */
export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

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
      contentBody: asArray<ContentBlock>(lesson.contentBody),
      hasPlayground: lesson.hasPlayground,
      playgroundLang: lesson.playgroundLang,
      starterCode: lesson.starterCode,
      exercisePrompt: lesson.exercisePrompt,
      quiz: asArray<QuizQuestion>(lesson.quiz).length ? asArray<QuizQuestion>(lesson.quiz) : null,
    };
  }
  const snap = (lesson.publishedSnapshot ?? null) as Partial<LessonContent> | null;
  return {
    objective: snap?.objective ?? lesson.objective,
    contentBody: asArray<ContentBlock>(snap?.contentBody ?? lesson.contentBody),
    hasPlayground: snap?.hasPlayground ?? false,
    playgroundLang: snap?.playgroundLang ?? lesson.playgroundLang,
    starterCode: snap?.starterCode ?? lesson.starterCode,
    exercisePrompt: snap?.exercisePrompt ?? lesson.exercisePrompt,
    quiz: asArray<QuizQuestion>(snap?.quiz ?? lesson.quiz).length
      ? asArray<QuizQuestion>(snap?.quiz ?? lesson.quiz)
      : null,
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

/** Flatten structured content blocks into plain searchable text. */
export function flattenBlocks(blocks: unknown): string {
  if (!Array.isArray(blocks)) return "";
  return (blocks as ContentBlock[])
    .map((b) => {
      switch (b.type) {
        case "heading":
        case "paragraph":
          return b.text;
        case "code":
          return b.code;
        case "list":
          return b.items.join(" ");
        case "video": {
          // Extract video ID as searchable text so video lessons are discoverable.
          const ytMatch = b.url.match(/(?:youtu\.be\/|watch\?v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
          return ytMatch ? `youtube ${ytMatch[1]}` : b.url;
        }
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join(" ");
}

/** Rough reading time in minutes (≈200 wpm). */
export function readingMinutes(content: Pick<LessonContent, "objective" | "contentBody">): number {
  const text = [
    content.objective ?? "",
    ...asArray<ContentBlock>(content.contentBody).map((b) => {
      if (b.type === "list") return b.items.join(" ");
      if (b.type === "code") return b.code;
      if (b.type === "video") return "";
      return b.text;
    }),
  ].join(" ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

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
          exam: {
            select: { id: true, title: true, published: true },
          },
        },
      },
    },
  })
);

export type LessonSearchResult = {
  id: string;
  title: string;
  slug: string;
  objective: string;
  contentText: string;
  topicTitle: string;
  topicSlug: string;
  subjectName: string;
  subjectSlug: string;
};

/** All publicly visible lessons, for the /learn catalog search. */
export const getAllPublishedLessons = cache(async (): Promise<LessonSearchResult[]> =>
  prisma.lesson
    .findMany({
      where: PUBLIC_LESSON_WHERE,
      orderBy: [
        { topic: { subject: { name: "asc" } } },
        { topic: { order: "asc" } },
        { order: "asc" },
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        objective: true,
        contentBody: true,
        publishedSnapshot: true,
        topic: {
          select: {
            title: true,
            slug: true,
            subject: { select: { name: true, slug: true } },
          },
        },
      },
    })
    .then((rows) =>
      rows.map((l) => {
        const snap =
          l.publishedSnapshot && typeof l.publishedSnapshot === "object"
            ? (l.publishedSnapshot as { objective?: unknown; contentBody?: unknown })
            : null;
        const liveBody = flattenBlocks(l.contentBody);
        const snapBody = snap ? flattenBlocks(snap.contentBody) : "";
        return {
          id: l.id,
          title: l.title,
          slug: l.slug,
          objective:
            typeof snap?.objective === "string" ? snap.objective : l.objective,
          contentText: [liveBody, snapBody].join(" "),
          topicTitle: l.topic.title,
          topicSlug: l.topic.slug,
          subjectName: l.topic.subject.name,
          subjectSlug: l.topic.subject.slug,
        };
      })
    )
);

/** Subject/topic/lesson slugs for every publicly visible lesson (SSG). */
export const getAllLessonPaths = cache(async () =>
  prisma.lesson.findMany({
    where: PUBLIC_LESSON_WHERE,
    select: {
      slug: true,
      topic: { select: { slug: true, subject: { select: { slug: true } } } },
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

/** Subjects with their topics and lesson counts — for the admin curriculum manager. */
export const getCurriculum = cache(async () =>
  prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { topics: true } },
      topics: {
        orderBy: [{ order: "asc" }, { title: "asc" }],
        include: { _count: { select: { lessons: true } } },
      },
    },
  })
);

// ---------------------------------------------------------------------------
// Learner progress
// ---------------------------------------------------------------------------

export const getCompletedLessonIds = cache(async (learnerId: string) =>
  prisma.userProgress
    .findMany({ where: { learnerId, completed: true }, select: { lessonId: true } })
    .then((rows) => new Set(rows.map((r) => r.lessonId)))
);

export const getMyProgress = cache(async (learnerId: string) =>
  prisma.userProgress.findMany({
    where: { learnerId, completed: true },
    orderBy: { completedAt: "desc" },
    include: { lesson: { include: { topic: { include: { subject: true } } } } },
  })
);

export type ContinueLesson = {
  lessonId: string;
  title: string;
  slug: string;
  topicTitle: string;
  topicSlug: string;
  subjectName: string;
  subjectSlug: string;
  completed: number;
  total: number;
};

/**
 * The next incomplete lesson for each subject the learner has started — the
 * "continue where you left off" list for the account dashboard.
 */
export const getContinueLessons = cache(
  async (learnerId: string): Promise<ContinueLesson[]> => {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: {
        topics: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              where: PUBLIC_LESSON_WHERE,
              orderBy: { order: "asc" },
              select: { id: true, slug: true, title: true },
            },
          },
        },
      },
    });
    const completed = await getCompletedLessonIds(learnerId);

    const out: ContinueLesson[] = [];
    for (const s of subjects) {
      const lessons = s.topics.flatMap((t) =>
        t.lessons.map((l) => ({ ...l, topicTitle: t.title, topicSlug: t.slug }))
      );
      if (lessons.length === 0) continue;
      const done = lessons.filter((l) => completed.has(l.id)).length;
      if (done === 0 || done === lessons.length) continue;
      const next = lessons.find((l) => !completed.has(l.id));
      if (!next) continue;
      out.push({
        lessonId: next.id,
        title: next.title,
        slug: next.slug,
        topicTitle: next.topicTitle,
        topicSlug: next.topicSlug,
        subjectName: s.name,
        subjectSlug: s.slug,
        completed: done,
        total: lessons.length,
      });
    }
    // Most-progressed subjects first, so the learner picks up near the finish line.
    return out.sort((a, b) => b.completed / b.total - a.completed / a.total);
  }
);

/** Lessons with a recorded quiz best score, for the account dashboard. */
export const getQuizScores = cache(async (learnerId: string) =>
  prisma.userProgress.findMany({
    where: { learnerId, bestScore: { not: null } },
    orderBy: { lastAttemptAt: "desc" },
    include: { lesson: { include: { topic: { include: { subject: true } } } } },
  })
);

// ---------------------------------------------------------------------------
// Exams
// ---------------------------------------------------------------------------

export type ExamQuestionType = "MC" | "TF" | "CODE";

export type ExamQuestionInput = {
  type: ExamQuestionType;
  question: string;
  options?: string[]; // MC only
  correctAnswer: string; // MC: index as string, TF: "True"/"False", CODE: expected stdout
  codeLanguage?: string; // CODE only
  codeTemplate?: string; // CODE only
};

/** Get an exam by topic ID (with questions, for authoring). */
export const getExamByTopic = cache(async (topicId: string) =>
  prisma.exam.findUnique({
    where: { topicId },
    include: {
      questions: { orderBy: { order: "asc" } },
      topic: { include: { subject: true } },
    },
  })
);

/** Get a published exam for taking (without correct answers). */
export const getPublishedExam = cache(async (topicId: string) =>
  prisma.exam.findUnique({
    where: { topicId, published: true },
    include: {
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          type: true,
          question: true,
          options: true,
          codeLanguage: true,
          codeTemplate: true,
          order: true,
          // intentionally omit correctAnswer
        },
      },
      topic: { include: { subject: true } },
    },
  })
);

/** Get all exam attempts for a learner on a topic. */
export const getExamAttempts = cache(async (examId: string, learnerId: string) =>
  prisma.examAttempt.findMany({
    where: { examId, learnerId },
    orderBy: { startedAt: "desc" },
  })
);

/** Check if a topic has a published exam. */
export const topicHasExam = cache(async (topicId: string) =>
  prisma.exam.findUnique({
    where: { topicId, published: true },
    select: { id: true },
  })
);

// ---------------------------------------------------------------------------
// Certificates — eligibility check (shared between API routes and actions)
// ---------------------------------------------------------------------------

export type CertificateEligibility = {
  eligible: boolean;
  hasCertificate: boolean;
  certificate?: { id: string } | null;
  reason?: string;
  completed?: number;
  total?: number;
  examsPassed?: number;
  examsTotal?: number;
};

/**
 * Check if a learner is eligible for a certificate for a given subject.
 * Returns whether they already have one, are eligible, or need to complete
 * more lessons. This is a pure data function — no auth, no redirects.
 */
export async function checkCertificateEligibilityFor(
  learnerId: string,
  subjectId: string
): Promise<CertificateEligibility> {
  // Check if already has certificate
  const existing = await prisma.certificate.findUnique({
    where: { learnerId_subjectId: { learnerId, subjectId } },
  });
  if (existing) return { eligible: true, hasCertificate: true, certificate: existing };

  // Get all published lessons in the subject
  const lessons = await prisma.lesson.findMany({
    where: {
      topic: { subjectId },
      OR: [{ status: "PUBLISHED" }, { publishedSnapshot: { not: Prisma.DbNull } }],
    },
    select: { id: true },
  });

  if (lessons.length === 0) {
    return { eligible: false, hasCertificate: false, reason: "No lessons available yet." };
  }

  // Check completion
  const completed = await prisma.userProgress.findMany({
    where: {
      learnerId,
      completed: true,
      lessonId: { in: lessons.map((l) => l.id) },
    },
    select: { lessonId: true },
  });

  const completedCount = completed.length;
  const totalCount = lessons.length;

  if (completedCount < totalCount) {
    return {
      eligible: false,
      hasCertificate: false,
      reason: `You've completed ${completedCount} of ${totalCount} lessons. Complete all lessons to earn a certificate.`,
      completed: completedCount,
      total: totalCount,
    };
  }

  // All published exams in the subject must have been passed at least once.
  // A subject with no published exams is certifiable on lessons alone.
  const exams = await prisma.exam.findMany({
    where: { topic: { subjectId }, published: true },
    select: { id: true, title: true },
  });

  if (exams.length > 0) {
    const passedAttempts = await prisma.examAttempt.findMany({
      where: {
        learnerId,
        passed: true,
        examId: { in: exams.map((e) => e.id) },
      },
      select: { examId: true },
      distinct: ["examId"],
    });

    if (passedAttempts.length < exams.length) {
      return {
        eligible: false,
        hasCertificate: false,
        reason: `You've passed ${passedAttempts.length} of ${exams.length} exams. Pass every course exam to earn a certificate.`,
        completed: completedCount,
        total: totalCount,
        examsPassed: passedAttempts.length,
        examsTotal: exams.length,
      };
    }
  }

  return { eligible: true, hasCertificate: false };
}

export type CertificateVerification = {
  certificateNo: string;
  learnerName: string;
  subjectName: string;
  issuedAt: Date;
};

/**
 * Public certificate lookup for the /learn/verify page. Deliberately returns
 * only what a third-party verifier may see — no payment amount, no ids, no
 * email. Auth-free by design so employers can verify without an account.
 */
export async function getCertificateForVerification(
  certificateNo: string
): Promise<CertificateVerification | null> {
  const certificate = await prisma.certificate.findUnique({
    where: { certificateNo },
    select: {
      certificateNo: true,
      issuedAt: true,
      learner: { select: { name: true } },
      subject: { select: { name: true } },
    },
  });
  if (!certificate) return null;
  return {
    certificateNo: certificate.certificateNo,
    learnerName: certificate.learner.name,
    subjectName: certificate.subject.name,
    issuedAt: certificate.issuedAt,
  };
}
