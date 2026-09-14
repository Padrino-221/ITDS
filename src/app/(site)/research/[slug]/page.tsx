import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui";
import ProjectsTable from "@/components/ProjectsTable";
import {
  getResearchAreaBySlug,
  getResearchAreas,
  getProjectsByResearchArea,
} from "@/lib/data";

export const revalidate = 3600;

export async function generateStaticParams() {
  const areas = await getResearchAreas();
  return areas.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = await getResearchAreaBySlug(slug);
  if (!area) return {};
  return {
    title: area.title,
    description: area.description,
    alternates: { canonical: `/research/${area.slug}` },
    openGraph: {
      type: "website",
      url: `/research/${area.slug}`,
      title: `${area.title} — Research — ITDS UENR`,
      description: area.description,
    },
  };
}

export default async function ResearchAreaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const area = await getResearchAreaBySlug(slug);
  if (!area) notFound();

  const projects = await getProjectsByResearchArea(area.id);

  return (
    <>
      <PageHeader
        title={area.title}
        subtitle={area.description}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Research Areas", href: "/research" },
          { label: area.title },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-xl">
            <Image
              src={area.image ?? "/images/research/ai.jpg"}
              alt={area.title}
              width={720}
              height={460}
              className="h-[320px] w-full object-cover"
            />
          </div>
          <div>
            <span className="inline-flex items-center gap-2 rounded-lg bg-gold-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-600">
              Research Area
            </span>
            <h2 className="display-heading mt-3 text-2xl font-extrabold uppercase tracking-tight text-forest-950 sm:text-3xl">
              About this area
            </h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-ink-soft">
              {area.description}
            </p>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="display-heading flex items-center gap-2 text-2xl font-extrabold uppercase tracking-tight text-forest-950">
                <FolderOpen className="h-6 w-6 text-gold-500" />
                Projects in this area
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                {projects.length > 0
                  ? `${projects.length} student project${projects.length === 1 ? "" : "s"} linked to ${area.title}.`
                  : `No projects have been linked to ${area.title} yet.`}
              </p>
            </div>
            <Link
              href="/research"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-forest-800 transition-colors hover:text-gold-600"
            >
              <ArrowLeft className="h-4 w-4" />
              All research areas
            </Link>
          </div>

          <div className="mt-6">
            {projects.length > 0 ? (
              <ProjectsTable projects={projects} initialLevel="ALL" />
            ) : (
              <EmptyState
                title="No projects yet"
                description="Student projects linked to this research area will appear here."
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
