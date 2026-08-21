import type { MetadataRoute } from "next";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { LEARN_URL, SITE_URL } from "@/lib/utils";

export const revalidate = 3600;

const BASE = SITE_URL;
const LEARN = LEARN_URL;

/** Public lessons visible in the e-learning hub. */
const PUBLIC_LESSON_WHERE: Prisma.LessonWhereInput = {
  OR: [{ status: "PUBLISHED" }, { publishedSnapshot: { not: Prisma.DbNull } }],
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/about/it-society",
    "/contact",
    "/gallery",
    "/lecturers",
    "/news",
    "/programs",
    "/projects",
    "/research",
  ].map((path) => ({ url: `${BASE}${path}`, changeFrequency: "weekly", priority: 0.7 }));

  const [lecturers, news, programs, projects, research, learnSubjects] = await Promise.all([
    prisma.supervisor.findMany({
      where: { profilePhoto: { not: null }, about: { not: null } },
      select: { slug: true },
    }),
    prisma.newsPost.findMany({ where: { published: true }, select: { slug: true } }),
    prisma.program.findMany({ where: { published: true }, select: { slug: true } }),
    prisma.project.findMany({ where: { published: true }, select: { slug: true } }),
    prisma.researchArea.findMany({ select: { slug: true } }),
    prisma.subject.findMany({
      select: {
        slug: true,
        topics: {
          select: {
            slug: true,
            lessons: {
              where: PUBLIC_LESSON_WHERE,
              select: { slug: true },
            },
          },
        },
      },
    }),
  ]);

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...lecturers.map((l) => ({ url: `${BASE}/lecturers/${l.slug}` })),
    ...news.map((n) => ({ url: `${BASE}/news/${n.slug}` })),
    ...programs.map((p) => ({ url: `${BASE}/programs/${p.slug}` })),
    ...projects.map((p) => ({ url: `${BASE}/projects/${p.slug}` })),
    ...research.map((r) => ({ url: `${BASE}/research/${r.slug}` })),
  ];

  for (const subject of learnSubjects) {
    dynamicRoutes.push({ url: `${LEARN}/${subject.slug}` });
    for (const topic of subject.topics) {
      for (const lesson of topic.lessons) {
        dynamicRoutes.push({
          url: `${LEARN}/${subject.slug}/${topic.slug}/${lesson.slug}`,
        });
      }
    }
  }

  return [...staticRoutes, ...dynamicRoutes];
}
