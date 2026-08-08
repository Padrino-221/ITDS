import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  FileText,
  GraduationCap,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { getProjectBySlug, getProjects, DEGREE_LABELS } from "@/lib/data";
import { absoluteUrl, paragraphs } from "@/lib/utils";

export async function generateStaticParams() {
  const projects = await getProjects("ALL");
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const description =
    project.abstract?.split(/\n\s*\n/)[0]?.slice(0, 160) ||
    `A ${DEGREE_LABELS[project.degreeLevel].toLowerCase()} project by ${project.studentName ?? "an ITDS student"} at UENR.`;
  return {
    title: project.title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "website",
      title: project.title,
      description,
      url: absoluteUrl(`/projects/${project.slug}`),
      images: project.image ? [project.image] : undefined,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: project.title,
        headline: project.title,
        description: project.abstract?.slice(0, 300) ?? undefined,
        image: project.image ? absoluteUrl(project.image) : undefined,
        url: absoluteUrl(`/projects/${project.slug}`),
        creator: project.studentName
          ? { "@type": "Person", name: project.studentName }
          : undefined,
        author: project.supervisor
          ? { "@type": "Person", name: project.supervisor.name }
          : undefined,
        isPartOf: {
          "@type": "CollegeOrUniversity",
          name: "University of Energy and Natural Resources (UENR)",
        },
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Projects", item: absoluteUrl("/projects") },
          {
            "@type": "ListItem",
            position: 3,
            name: project.title,
            item: absoluteUrl(`/projects/${project.slug}`),
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />

      <section className="relative overflow-hidden bg-forest-900 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #c9942a 0, transparent 35%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <Link
            href="/projects"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gold-300 hover:text-gold-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Project Works
          </Link>
          <div className="mb-4">
            <Badge className="bg-gold-500 text-white">
              {DEGREE_LABELS[project.degreeLevel]}
            </Badge>
          </div>
          <h1 className="display-heading mt-3 max-w-3xl text-3xl font-extrabold uppercase tracking-tight text-balance sm:text-4xl">
            {project.title}
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-forest-100/85">
            {project.studentName && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-gold-400" />
                {project.studentName}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gold-400" />
              {project.academicYear ?? "—"}
            </span>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Abstract */}
          <article className="lg:col-span-2">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-forest-900">
              <FileText className="h-5 w-5 text-gold-600" />
              Project Abstract
            </h2>
            <div className="prose-content mt-4">
              {paragraphs(project.abstract ?? project.title).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {project.image && (
              <div className="relative h-56 overflow-hidden rounded-xl">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, 100vw"
                  className="object-cover"
                />
              </div>
            )}

            <div className="rounded-xl border border-forest-100 bg-white p-6">
              <h3 className="font-display text-lg font-bold text-forest-900">
                Project Details
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">Degree Level</dt>
                  <dd className="font-semibold text-forest-800">
                    {DEGREE_LABELS[project.degreeLevel]}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">Programme</dt>
                  <dd className="font-semibold text-forest-800">
                    {project.program ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">Academic Year</dt>
                  <dd className="font-semibold text-forest-800">
                    {project.academicYear ?? "—"}
                  </dd>
                </div>
              </dl>
            </div>

            {project.supervisor && (
              <Link
                href={`/lecturers/${project.supervisor.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-forest-100 bg-white p-5 transition-all hover:-translate-y-0.5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-forest-800 text-gold-300">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Supervisor
                  </p>
                  <p className="font-display font-bold text-forest-900 group-hover:text-forest-700">
                    {project.supervisor.name}
                  </p>
                </div>
              </Link>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
