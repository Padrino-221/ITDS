import { cache } from "react";
import type { DegreeLevel, Project, Supervisor } from "@prisma/client";
import { prisma } from "./prisma";

export const DEGREE_LABELS: Record<DegreeLevel, string> = {
  UNDERGRADUATE: "Undergraduate",
  DIPLOMA: "Diploma",
  MSC: "MSc",
  MPHIL: "MPhil",
  PHD: "PhD",
};

export const DEGREE_ORDER: DegreeLevel[] = [
  "UNDERGRADUATE",
  "DIPLOMA",
  "MSC",
  "MPHIL",
  "PHD",
];

/**
 * The programmes students are enrolled in, offered in the SPMS project form.
 * Each programme implies its degree level. (The `Program` table holds the
 * public /programs category pages, not these enrolment programmes.)
 */
export const SPMS_PROGRAMS: Array<{ title: string; degreeLevel: DegreeLevel }> = [
  { title: "BSc Information Technology", degreeLevel: "UNDERGRADUATE" },
  { title: "Diploma Information Technology", degreeLevel: "DIPLOMA" },
  { title: "MSc Information Technology", degreeLevel: "MSC" },
  { title: "MPhil Information Technology", degreeLevel: "MPHIL" },
  { title: "PhD Information Technology", degreeLevel: "PHD" },
];

export const getPrograms = cache(async () =>
  prisma.program.findMany({
    where: { published: true },
    orderBy: { createdAt: "asc" },
  })
);

export const getProgramBySlug = cache(async (slug: string) =>
  prisma.program.findUnique({
    where: { slug },
  })
);

export const getProgramByLevel = cache(async (degreeLevel: DegreeLevel) =>
  prisma.program.findUnique({
    where: { degreeLevel },
  })
);

export const getNewsPosts = cache(async (limit?: number) =>
  prisma.newsPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    ...(limit ? { take: limit } : {}),
  })
);

export const getNewsBySlug = cache(async (slug: string) =>
  prisma.newsPost.findFirst({
    where: { slug, published: true },
  })
);

export const getNewsCategories = cache(async (): Promise<string[]> => {
  const posts = await prisma.newsPost.findMany({
    where: { published: true },
    select: { category: true },
  });
  return Array.from(new Set(posts.map((p) => p.category))).sort();
});

export const getProjects = cache(async (level?: DegreeLevel | "ALL", limit?: number) =>
  prisma.project.findMany({
    where: {
      published: true,
      ...(level && level !== "ALL" ? { degreeLevel: level } : {}),
    },
    include: { supervisor: true },
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
  })
);

export const getProjectBySlug = cache(async (slug: string) =>
  prisma.project.findFirst({
    where: { slug, published: true },
    include: { supervisor: true },
  })
);

export type PublicLecturer = {
  id: string;
  slug: string;
  name: string;
  title: string;
  photo: string | null;
  bio: string | null;
  email: string | null;
  researchInterests: string | null;
  projects: Project[];
  _count: { projects: number };
};

/**
 * Display name for a supervisor: the honorific (Mr., Dr., Prof.…) belongs to
 * the name. Guards against doubling when the stored name already starts with
 * the title.
 */
export function formatSupervisorName(
  supervisor: Pick<Supervisor, "name" | "userTitle">
): string {
  const rawName = supervisor.name?.trim() ?? "";
  const prefix = supervisor.userTitle?.trim() ?? "";
  return prefix && !rawName.toLowerCase().startsWith(prefix.toLowerCase())
    ? `${prefix} ${rawName}`.trim()
    : rawName;
}

/**
 * A supervisor whose SPMS profile is complete enough to be shown publicly
 * (same bar the /lecturers pages use: photo + bio).
 */
export function isPublicLecturerProfile(
  supervisor: Pick<Supervisor, "slug" | "profilePhoto" | "about">
): boolean {
  return Boolean(supervisor.slug && supervisor.profilePhoto && supervisor.about);
}

/**
 * Shape a Supervisor record for the public /lecturers pages. A supervisor's
 * profile is "complete" (and shown publicly) only when both a photo and a bio
 * have been provided via the SPMS profile form.
 */
export function toPublicLecturer(
  supervisor: Supervisor & {
    projects?: Project[];
    _count?: { projects: number };
  }
): PublicLecturer {
  const interests = [supervisor.researchArea1, supervisor.researchArea2]
    .filter(Boolean)
    .join(", ");
  return {
    id: supervisor.id,
    slug: supervisor.slug,
    name: formatSupervisorName(supervisor),
    title: supervisor.jobRank?.trim() || "Lecturer",
    photo: supervisor.profilePhoto,
    bio: supervisor.about,
    email: supervisor.email,
    researchInterests: interests || null,
    projects: supervisor.projects ?? [],
    _count: {
      projects: supervisor._count?.projects ?? supervisor.projects?.length ?? 0,
    },
  };
}

export const getLecturers = cache(async (): Promise<PublicLecturer[]> => {
  const supervisors = await prisma.supervisor.findMany({
    where: { profilePhoto: { not: null }, about: { not: null } },
    orderBy: { name: "asc" },
    include: { _count: { select: { projects: true } } },
  });
  return supervisors.map(toPublicLecturer);
});

export const getLecturerBySlug = cache(async (slug: string): Promise<PublicLecturer | null> => {
  const supervisor = await prisma.supervisor.findUnique({
    where: {
      slug,
      profilePhoto: { not: null },
      about: { not: null },
    },
    include: {
      projects: {
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
  return supervisor ? toPublicLecturer(supervisor) : null;
});

export const getResearchAreas = cache(async () =>
  prisma.researchArea.findMany({ orderBy: { order: "asc" } })
);

export const getGallery = cache(async () =>
  prisma.galleryImage.findMany({ orderBy: { order: "asc" } })
);
