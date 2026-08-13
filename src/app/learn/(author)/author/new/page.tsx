import { FilePlus2 } from "lucide-react";
import { getSubjects } from "@/lib/learn";
import { createLesson } from "@/app/learn/actions";
import { Select } from "@/components/admin/Dropdown";
import { requireRole } from "@/lib/auth";
import { absoluteUrl } from "@/lib/utils";

export const metadata = { title: "New lesson — Authoring" };

export default async function NewLessonPage() {
  await requireRole(["LECTURER", "ADMIN"], absoluteUrl("/staff-panel/login"));
  const subjects = await getSubjects();

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
        Choose a course, state the topic, then give your lesson a title.
      </p>

      <form
        action={createLesson}
        className="mt-8 space-y-5 rounded-2xl border border-forest-100 bg-white p-6 sm:p-8"
      >
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
            Course <span className="text-red-500">*</span>
          </label>
          <Select
            name="subjectId"
            required
            placeholder="Choose a course…"
            options={subjects.map((s) => ({ value: s.id, label: s.name }))}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
            Topic <span className="text-red-500">*</span>
          </label>
          <input
            name="topicTitle"
            required
            minLength={2}
            placeholder="e.g. HTML & CSS Basics"
            className="w-full rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm text-forest-950 placeholder:text-ink-soft/60 outline-none transition-all focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
          />
          <p className="mt-1 text-xs text-ink-soft">
            If this topic doesn&apos;t exist yet it will be created automatically.
          </p>
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
