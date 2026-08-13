import Link from "next/link";
import { ClipboardCheck, ListTree } from "lucide-react";
import { getReviewQueue, LESSON_STATUS_LABEL } from "@/lib/learn";
import { QueryToast } from "@/components/admin/QueryToast";
import { requireRole } from "@/lib/auth";
import { absoluteUrl, formatDate, learnUrl } from "@/lib/utils";

export default async function ReviewQueuePage() {
  await requireRole(["ADMIN"], absoluteUrl("/staff-panel/login"));
  const queue = await getReviewQueue();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div>
        <span className="inline-flex items-center gap-2 rounded-lg bg-gold-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-600">
          <ClipboardCheck className="h-4 w-4" />
          Review
        </span>
        <h1 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-forest-950">
          Review queue
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Nothing goes live until you approve it. Request changes to send a lesson back to its author.
        </p>
      </div>

      <QueryToast param="done" message="Review decision saved." />

      {queue.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-forest-200 bg-white px-6 py-16 text-center">
          <ClipboardCheck className="mx-auto h-8 w-8 text-forest-200" />
          <p className="mt-3 font-display text-lg font-bold text-forest-900">
            Queue is clear
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            No lessons are waiting for review right now.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {queue.map((lesson) => (
            <li key={lesson.id}>
              <Link
                href={learnUrl(`/review/${lesson.id}`)}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-forest-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-md"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-50">
                  <ClipboardCheck className="h-5 w-5 text-gold-600" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-forest-900">
                    {lesson.title}
                  </span>
                  <span className="block text-xs text-ink-soft">
                    {lesson.topic.subject.name} · {lesson.topic.title} · by {lesson.author.name}
                  </span>
                </span>
                <span className="hidden shrink-0 text-xs text-ink-soft lg:block">
                  Submitted {formatDate(lesson.updatedAt)}
                </span>
                <span className="rounded-lg bg-gold-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-gold-600">
                  {LESSON_STATUS_LABEL[lesson.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Curriculum structure is managed separately */}
      <div className="mt-14 rounded-2xl border border-forest-100 bg-white p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-forest-950">
          <ListTree className="h-5 w-5 text-gold-500" />
          Courses &amp; topics
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Create, rename, reorder or delete courses and topics — including lesson counts —
          on the curriculum manager.
        </p>
        <Link
          href={learnUrl("/manage")}
          className="mt-4 inline-flex rounded-lg bg-forest-950 px-4 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800"
        >
          Manage curriculum
        </Link>
      </div>
    </div>
  );
}
