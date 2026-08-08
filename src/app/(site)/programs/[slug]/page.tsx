import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPrograms, getProgramBySlug, DEGREE_LABELS } from "@/lib/data";
import { ArrowLeft, BookOpen, Target, LayoutList, Mail } from "lucide-react";
import { absoluteUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const programs = await getPrograms();
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return { title: "Programme Not Found" };
  const degree = DEGREE_LABELS[program.degreeLevel];
  const description = program.overview.split("\n")[0].substring(0, 160);
  return {
    title: `${degree} — Programmes`,
    description,
    alternates: { canonical: `/programs/${program.slug}` },
    openGraph: {
      type: "website",
      title: `${degree} Programme — ITDS UENR`,
      description,
      url: absoluteUrl(`/programs/${program.slug}`),
    },
  };
}

function renderMarkdown(text: string) {
  if (!text) return null;
  return text.split("\n").map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <h3 key={i} className="mt-6 font-display text-lg font-bold text-forest-900">
          {line.replace(/\*\*/g, "")}
        </h3>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <li key={i} className="ml-4 list-disc text-ink">
          {line.slice(2)}
        </li>
      );
    }
    if (line.trim() === "") return <br key={i} />;
    return (
      <p key={i} className="text-ink">
        {line}
      </p>
    );
  });
}

export default async function ProgramPage({ params }: Props) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  const degree = DEGREE_LABELS[program.degreeLevel];
  const programJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: `${degree} Programme`,
    url: absoluteUrl(`/programs/${program.slug}`),
    description: program.overview.split("\n")[0].substring(0, 300),
    educationalProgramMode: "onsite",
    inLanguage: "en",
    provider: {
      "@type": "CollegeOrUniversity",
      name: "University of Energy and Natural Resources (UENR)",
      department: {
        "@type": "Organization",
        name: "Department of Information Technology and Decision Sciences",
      },
    },
  };

  const sections = [
    {
      title: "Programme Overview",
      icon: BookOpen,
      content: program.overview,
    },
    {
      title: "Learning Objectives",
      icon: Target,
      content: program.learningObjectives,
    },
    {
      title: "Curriculum Structure",
      icon: LayoutList,
      content: program.curriculumStructure,
    },
    {
      title: "Programme Contact",
      icon: Mail,
      content: program.programmeContact,
    },
  ];

  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(programJsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-forest-950 py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(236,59,106,0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/programs"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-200 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            All Programmes
          </Link>
          <h1 className="display-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            {degree} Programme
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-forest-50 text-forest-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-forest-900">
                    {section.title}
                  </h2>
                </div>
                <div className="rounded-2xl border border-forest-100 bg-forest-50/50 p-6 leading-relaxed">
                  {renderMarkdown(section.content)}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
