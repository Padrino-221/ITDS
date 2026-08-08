import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpenCheck, ChevronRight, PlayCircle } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui";
import { getSubjectWithTopics, getSubjects } from "@/lib/learn";

export async function generateStaticParams() {
  const subjects = await getSubjects();
  return subjects.map((s) => ({ subject: s.slug }));
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject: slug } = await params;
  const subject = await getSubjectWithTopics(slug);
  if (!subject) notFound();

  return (
    <>
      <PageHeader
        title={subject.name}
        subtitle={subject.description ?? undefined}
        crumbs={[{ label: "Home", href: "/" }, { label: "Learn", href: "/learn" }, { label: subject.name }]}
        accent="forest"
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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
                <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-forest-300">
                  {topic.lessons.length} {topic.lessons.length === 1 ? "lesson" : "lessons"}
                </span>
              </div>
              <ul className="divide-y divide-forest-50">
                {topic.lessons.map((lesson, i) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/learn/${subject.slug}/${topic.slug}/${lesson.slug}`}
                      className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-forest-50/60"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-50 text-sm font-extrabold text-forest-700 transition-colors group-hover:bg-forest-600 group-hover:text-white">
                        {i + 1}
                      </span>
                      <span className="flex-1 font-semibold text-forest-900 group-hover:text-forest-700">
                        {lesson.title}
                      </span>
                      <PlayCircle className="h-5 w-5 text-forest-300 transition-colors group-hover:text-forest-600" />
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
          href="/learn"
          className="mt-10 inline-flex items-center gap-1.5 text-sm font-bold text-forest-600 hover:text-forest-700"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          All subjects
        </Link>
      </section>
    </>
  );
}
