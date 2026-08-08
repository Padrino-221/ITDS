import { FilePlus2 } from "lucide-react";
import { getSubjectsWithTopics } from "@/lib/learn";
import { createLesson } from "@/app/(site)/learn/actions";
import { Select } from "@/components/admin/Dropdown";
import { requireRole } from "@/lib/auth";

export const metadata = { title: "New lesson — Authoring" };

export default async function NewLessonPage() {
  await requireRole(["LECTURER", "EDITOR", "ADMIN"], "/learn/account/signin");
  const subjects = await getSubjectsWithTopics();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <span className="inline-flex items-center gap-2 rounded-lg bg-gold-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-600">
        <FilePlus2 className="h-4 w-4" />
        Authoring
      </span>
      <h1 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-forest-950">
        New lesson
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Choose where the lesson lives, then build it against the fixed template.
      </p>

      <form
        action={createLesson}
        className="mt-8 space-y-5 rounded-2xl border border-forest-100 bg-white p-6 sm:p-8"
      >
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
            Topic <span className="text-red-500">*</span>
          </label>
          <Select
            name="topicId"
            required
            placeholder="Choose a topic…"
            options={subjects.flatMap((s) =>
              s.topics.map((t) => ({ value: t.id, label: `${t.title} — ${s.name}` }))
            )}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
            Lesson title <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            required
            minLength={3}
            placeholder="e.g. Your First Web Page"
            className="w-full rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm text-forest-950 placeholder:text-ink-soft/60 outline-none transition-all focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-forest-950 px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lg"
        >
          Create lesson draft
        </button>
      </form>
    </div>
  );
}
