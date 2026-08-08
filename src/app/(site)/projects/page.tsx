import { Suspense } from "react";
import type { DegreeLevel } from "@prisma/client";
import { PageHeader, EmptyState } from "@/components/ui";
import { ProjectCard } from "@/components/cards";
import ProjectsFilter from "@/components/ProjectsFilter";
import { DEGREE_LABELS, getProjects } from "@/lib/data";

export const metadata = { title: "Project Works" };

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

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-ink-soft">
            Showing{" "}
            <span className="font-semibold text-forest-800">
              {validLevel === "ALL" ? "all" : DEGREE_LABELS[validLevel]}
            </span>{" "}
            projects
          </p>
          <p className="text-sm font-semibold text-forest-800">{projects.length} result(s)</p>
        </div>

        {projects.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No projects found"
              description="Projects in this category will appear here once published."
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
