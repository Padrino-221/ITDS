import { cache } from "react";
import type { DegreeLevel } from "@prisma/client";
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

export const getLecturers = cache(async () =>
  prisma.lecturer.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { projects: true } } },
  })
);

export const getLecturerBySlug = cache(async (slug: string) =>
  prisma.lecturer.findUnique({
    where: { slug },
    include: {
      projects: { where: { published: true }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  })
);

export const getResearchAreas = cache(async () =>
  prisma.researchArea.findMany({ orderBy: { order: "asc" } })
);

export const getGallery = cache(async () =>
  prisma.galleryImage.findMany({ orderBy: { order: "asc" } })
);
