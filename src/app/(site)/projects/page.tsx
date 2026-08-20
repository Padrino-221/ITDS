import { Suspense } from "react";
import type { DegreeLevel } from "@prisma/client";
import { PageHeader } from "@/components/ui";
import ProjectsFilter from "@/components/ProjectsFilter";
import ProjectsTable from "@/components/ProjectsTable";
import { DEGREE_LABELS, getProjects } from "@/lib/data";

export const metadata = {
  title: "Project Works",
  description:
    "Browse student project works from the Department of Information Technology and Decision Sciences, UENR — filterable by degree level from Undergraduate to PhD.",
  alternates: { canonical: "/projects" },
  openGraph: {
    type: "website",
    url: "/projects",
    title: "Project Works — ITDS UENR",
    description:
      "Student project works from the Department of Information Technology and Decision Sciences, UENR.",
  },
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const { level } = await searchParams;
  const validLevel = (Object.keys(DEGREE_LABELS) as DegreeLevel[]).includes(
    level as DegreeLevel
  )
    ? (level as DegreeLevel)
    : "ALL";

  const projects = await getProjects(validLevel);

  return (
    <>
      <PageHeader
        title="Project Works"
        subtitle="Browse the Student Project Management System (SPMS) repository — undergraduate, diploma and postgraduate projects."
        crumbs={[{ label: "Home", href: "/" }, { label: "Project Works" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Suspense>
          <ProjectsFilter />
        </Suspense>

        <div className="mt-6">
          <ProjectsTable projects={projects} initialLevel={validLevel} />
        </div>
      </section>
    </>
  );
}
