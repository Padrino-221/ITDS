import Link from "next/link";
import { CheckCircle2, ClipboardCheck, FolderPlus, ListPlus } from "lucide-react";
import { getReviewQueue, getSubjectsWithTopics, LESSON_STATUS_LABEL } from "@/lib/learn";
import { createSubject, createTopic } from "@/app/(site)/learn/actions";
import { Select } from "@/components/admin/Dropdown";
import { requireRole } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-forest-950 placeholder:text-ink-soft/60 outline-none transition-all focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20";

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string; created?: string }>;
}) {
  const { done, created } = await searchParams;
  await requireRole(["ADMIN"], "/learn/account/signin");
  const [queue, subjects] = await Promise.all([getReviewQueue(), getSubjectsWithTopics()]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
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

      {(done === "1" || created) && (
        <p className="mt-6 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {created === "subject" && "Subject created."}
          {created === "topic" && "Topic created."}
          {done === "1" && "Review decision saved."}
        </p>
      )}

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
                href={`/learn/review/${lesson.id}`}
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

      {/* Structure management */}
      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-forest-100 bg-white p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-forest-950">
            <FolderPlus className="h-5 w-5 text-gold-500" />
            New subject
          </h2>
          <form action={createSubject} className="mt-4 space-y-3">
            <input
              name="name"
              required
              minLength={2}
              placeholder="Subject name, e.g. Web Development"
              className={inputClass}
            />
            <textarea
              name="description"
              rows={2}
              placeholder="Short description (optional)"
              className={cn(inputClass, "resize-y")}
            />
            <button
              type="submit"
              className="rounded-lg bg-forest-950 px-4 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800"
            >
              Create subject
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-forest-100 bg-white p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-forest-950">
            <ListPlus className="h-5 w-5 text-gold-500" />
            New topic
          </h2>
          <form action={createTopic} className="mt-4 space-y-3">
            <Select
              name="subjectId"
              required
              placeholder="Choose a subject…"
              options={subjects.map((s) => ({ value: s.id, label: s.name }))}
            />
            <input
              name="title"
              required
              minLength={2}
              placeholder="Topic title, e.g. HTML & CSS Basics"
              className={inputClass}
            />
            <input
              name="order"
              type="number"
              min={0}
              defaultValue={0}
              placeholder="Order (0 first)"
              className={cn(inputClass, "max-w-[160px]")}
            />
            <button
              type="submit"
              className="rounded-lg bg-forest-950 px-4 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800"
            >
              Create topic
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
