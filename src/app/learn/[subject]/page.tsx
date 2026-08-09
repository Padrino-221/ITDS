import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookOpenCheck, ChevronRight, PlayCircle } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui";
import { getSubjectWithTopics, getSubjects } from "@/lib/learn";

export const revalidate = 3600;

export async function generateStaticParams() {
  const subjects = await getSubjects();
  return subjects.map((s) => ({ subject: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string }>;
}): Promise<Metadata> {
  const { subject: slug } = await params;
  const subject = await getSubjectWithTopics(slug);
  if (!subject) return {};
  return {
    title: `${subject.name} — E-Learning`,
    description: subject.description ?? `Lessons and topics for ${subject.name} on the ITDS E-Learning Hub.`,
  };
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject: slug } = await params;
  const subject = await getSubjectWithTopics(slug);
  if (!subject) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: subject.name,
    description: subject.description ?? undefined,
    provider: {
      "@type": "CollegeOrUniversity",
      name: "Department of Information Technology and Decision Sciences, UENR",
    },
    inLanguage: "en",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      name: `${subject.name} on the ITDS E-Learning Hub`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        title={subject.name}
        subtitle={subject.description ?? undefined}
        crumbs={[{ label: "Home", href: "/" }, { label: "Learn", href: "/" }, { label: subject.name }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="space-y-8">
          {subject.topics.map((topic) => (
            <div
              key={topic.id}
              className="overflow-hidden rounded-2xl border border-forest-100 bg-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forest-100 bg-forest-950 px-6 py-4">
                <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-white">
                  {topic.title}
                </h2>
                <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-400">
                  {topic.lessons.length} {topic.lessons.length === 1 ? "lesson" : "lessons"}
                </span>
              </div>
              <ul className="divide-y divide-forest-50">
                {topic.lessons.map((lesson, i) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/${subject.slug}/${topic.slug}/${lesson.slug}`}
                      className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gold-50/60 sm:px-6 sm:py-4"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest-50 text-sm font-extrabold text-forest-700 transition-colors group-hover:bg-gold-500 group-hover:text-white sm:h-9 sm:w-9">
                        {i + 1}
                      </span>
                      <span className="flex-1 min-w-0 font-semibold text-forest-900 group-hover:text-gold-700 text-sm sm:text-base">
                        {lesson.title}
                      </span>
                      <PlayCircle className="h-4 w-4 text-forest-300 transition-colors group-hover:text-gold-500 sm:h-5 sm:w-5" />
                    </Link>
                  </li>
                ))}
                {topic.lessons.length === 0 && (
                  <li className="px-6 py-6 text-sm text-ink-soft">
                    <BookOpenCheck className="mr-2 inline h-4 w-4" />
                    Lessons in this topic are being prepared.
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        {subject.topics.length === 0 && (
          <EmptyState
            title="No topics yet"
            description="Topics for this subject are being structured by the department."
          />
        )}

        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-1.5 text-sm font-bold text-gold-600 hover:text-gold-700"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          All subjects
        </Link>
      </section>
    </>
  );
}
