import Link from "next/link";
import { CheckCircle2, FilePlus2, PenLine } from "lucide-react";
import { getMyLessons, LESSON_STATUS_LABEL, LESSON_STATUS_TONE } from "@/lib/learn";
import { QueryToast } from "@/components/admin/QueryToast";
import { requireRole } from "@/lib/auth";
import { absoluteUrl, cn, formatDate, learnUrl } from "@/lib/utils";

export default async function AuthorDashboardPage() {
  const user = await requireRole(["LECTURER", "ADMIN"], absoluteUrl("/staff-panel/login"));
  const lessons = await getMyLessons(user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-lg bg-gold-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-600">
            <PenLine className="h-4 w-4" />
            Authoring
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-forest-950">
            My lessons
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Write against the fixed template, then submit for review. Nothing goes
            live without an admin&apos;s approval.
          </p>
        </div>
        <Link
          href={learnUrl("/author/new")}
          className="inline-flex items-center gap-2 rounded-lg bg-forest-950 px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lg"
        >
          <FilePlus2 className="h-4 w-4" />
          New lesson
        </Link>
      </div>

      <QueryToast param="submitted" message="Lesson submitted for review. You'll be notified of the decision here." />

      {lessons.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-forest-200 bg-white px-6 py-16 text-center">
          <PenLine className="mx-auto h-8 w-8 text-forest-200" />
          <p className="mt-3 font-display text-lg font-bold text-forest-900">
            No lessons yet
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Create your first lesson from the fixed template.
          </p>
          <Link
            href={learnUrl("/author/new")}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-gold-600"
          >
            <FilePlus2 className="h-4 w-4" />
            New lesson
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <Link
                href={learnUrl(`/author/${lesson.id}/edit`)}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-forest-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-md"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-forest-50">
                  <PenLine className="h-5 w-5 text-forest-700" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-forest-900">
                    {lesson.title}
                  </span>
                  <span className="block text-xs text-ink-soft">
                    {lesson.topic.subject.name} · {lesson.topic.title}
                  </span>
                </span>
                {lesson.reviewNote && (
                  <span className="hidden max-w-xs truncate text-xs text-red-500 md:block">
                    Note: {lesson.reviewNote}
                  </span>
                )}
                <span
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                    LESSON_STATUS_TONE[lesson.status]
                  )}
                >
                  {LESSON_STATUS_LABEL[lesson.status]}
                </span>
                <span className="hidden shrink-0 text-xs text-ink-soft lg:block">
                  Updated {formatDate(lesson.updatedAt)}
                </span>
                <CheckCircle2 className="hidden h-4 w-4 text-forest-300 sm:block" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}