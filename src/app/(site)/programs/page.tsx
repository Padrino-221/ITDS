import type { Metadata } from "next";
import Link from "next/link";
import { getPrograms, DEGREE_LABELS } from "@/lib/data";
import { ArrowRight, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "Explore our undergraduate, diploma, and postgraduate programmes in Information Technology & Decision Sciences.",
  alternates: { canonical: "/programs" },
  openGraph: {
    type: "website",
    url: "/programs",
    title: "Programmes — ITDS UENR",
    description:
      "Undergraduate, diploma and postgraduate programmes in Information Technology & Decision Sciences at UENR.",
  },
};

export default async function ProgrammesPage() {
  const programs = await getPrograms();

  return (
    <main className="bg-white">
      <PageHeader
        title="Academic Programmes"
        subtitle="From diploma to doctoral studies, we offer a range of programmes designed to equip you with the skills and knowledge for a successful career in IT."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Programmes" },
        ]}
      />

      {/* Programmes Grid */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Link
              key={program.slug}
              href={`/programs/${program.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-forest-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-forest-50 text-forest-700 transition-colors group-hover:bg-forest-900 group-hover:text-white">
                <BookOpen className="h-6 w-6" />
              </div>
              <h2 className="font-display text-xl font-bold text-forest-900">
                {DEGREE_LABELS[program.degreeLevel]}
              </h2>
              <p className="mt-3 line-clamp-3 text-sm text-ink-soft">
                {program.overview.split("\n")[0].substring(0, 150)}...
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 transition-colors group-hover:text-gold-600">
                View Programme
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
