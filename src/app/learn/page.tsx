import Link from "next/link";
import { ArrowRight, FolderTree, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { getSubjects } from "@/lib/learn";
import { getStringSetting } from "@/lib/settings";

export default async function LearnHomePage() {
  const [subjects, announcement] = await Promise.all([
    getSubjects(),
    getStringSetting(
      "learn_intro",
      "Free, structured lessons authored by our lecturers — learn at your own pace."
    ),
  ]);

  return (
    <>
      <PageHeader
        title="ITDS E-Learning Hub"
        subtitle={announcement}
        crumbs={[{ label: "Home", href: "/" }, { label: "Learn" }]}
        accent="forest"
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject, i) => (
            <Link
              key={subject.id}
              href={`/learn/${subject.slug}`}
              className="group flex flex-col rounded-2xl border border-forest-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-forest-300 hover:shadow-xl hover:shadow-forest-950/5"
            >
              <span
                className={
                  i % 2 === 0
                    ? "flex h-12 w-12 items-center justify-center rounded-xl bg-forest-50 text-forest-700"
                    : "flex h-12 w-12 items-center justify-center rounded-xl bg-forest-50 text-forest-700"
                }
              >
                <FolderTree className="h-6 w-6" />
              </span>
              <h2 className="mt-4 font-display text-xl font-extrabold text-forest-950 group-hover:text-forest-700">
                {subject.name}
              </h2>
              {subject.description && (
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                  {subject.description}
                </p>
              )}
              <span className="mt-5 flex items-center justify-between border-t border-forest-100 pt-4 text-sm font-bold text-forest-800">
                <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-ink-soft">
                  <GraduationCap className="h-4 w-4" />
                  {subject._count.topics} {subject._count.topics === 1 ? "topic" : "topics"}
                </span>
                <span className="flex items-center gap-1 text-forest-600 transition-transform group-hover:translate-x-1">
                  Start learning <ArrowRight className="h-4 w-4" />
                </span>
              </span>
            </Link>
          ))}
        </div>

        {subjects.length === 0 && (
          <p className="rounded-2xl border border-dashed border-forest-200 bg-white px-6 py-16 text-center text-ink-soft">
            Lessons are being prepared — check back soon.
          </p>
        )}
      </section>
    </>
  );
}
