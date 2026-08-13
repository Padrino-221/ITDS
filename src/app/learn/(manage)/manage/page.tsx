import Link from "next/link";
import {
  ClipboardList,
  FolderOpen,
  FolderPlus,
  PenLine,
  Plus,
} from "lucide-react";
import { getCurriculum } from "@/lib/learn";
import {
  createSubject,
  createTopic,
  updateSubject,
  updateTopic,
  deleteSubject,
  deleteTopic,
} from "@/app/learn/actions";
import { Select } from "@/components/admin/Dropdown";
import DeleteButton from "@/components/admin/DeleteButton";
import { QueryToast } from "@/components/admin/QueryToast";
import { requireRole } from "@/lib/auth";
import { cn, absoluteUrl, learnUrl } from "@/lib/utils";
import { inputClass } from "@/lib/styles";

const editToggleClass =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-forest-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-gold-400 hover:text-gold-700 [&::-webkit-details-marker]:hidden list-none";

const saveButtonClass =
  "rounded-lg bg-forest-950 px-4 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800";

export default async function ManageCurriculumPage() {
  await requireRole(["ADMIN"], absoluteUrl("/staff-panel/login"));
  const subjects = await getCurriculum();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-lg bg-gold-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-600">
            <ClipboardList className="h-4 w-4" />
            Manage
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-forest-950">
            Courses &amp; topics
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Rename, reorder or remove the curriculum structure. Courses and topics holding
            content are protected — empty them first.
          </p>
        </div>
        <Link
          href={learnUrl("/review")}
          className="rounded-lg border border-forest-200 bg-white px-4 py-2 text-sm font-bold text-ink-soft transition-colors hover:border-gold-400 hover:text-gold-700"
        >
          Go to review queue
        </Link>
      </div>

      <QueryToast
        param="created"
        messages={{ subject: "Course created.", topic: "Topic created." }}
      />
      <QueryToast
        param="updated"
        messages={{ subject: "Course updated.", topic: "Topic updated." }}
      />
      <QueryToast
        param="deleted"
        messages={{ subject: "Course deleted.", topic: "Topic deleted." }}
      />

      {subjects.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-forest-200 bg-white px-6 py-16 text-center">
          <FolderOpen className="mx-auto h-8 w-8 text-forest-200" />
          <p className="mt-3 font-display text-lg font-bold text-forest-900">
            No courses yet
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Create your first course below, then add topics and lessons.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-5">
          {subjects.map((subject) => (
            <li key={subject.id} className="rounded-2xl border border-forest-100 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-forest-950">
                    <FolderOpen className="h-5 w-5 shrink-0 text-gold-500" />
                    <span className="truncate">{subject.name}</span>
                  </h2>
                  <p className="mt-1 text-xs text-ink-soft">
                    /learn/{subject.slug} · {subject._count.topics} topic
                    {subject._count.topics === 1 ? "" : "s"}
                  </p>
                  {subject.description && (
                    <p className="mt-2 max-w-prose text-sm text-ink">{subject.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <details className="group">
                    <summary className={editToggleClass}>
                      <PenLine className="h-3.5 w-3.5" />
                      Edit
                    </summary>
                    <form
                      action={updateSubject}
                      className="mt-3 space-y-3 rounded-xl border border-forest-100 bg-forest-50/40 p-4"
                    >
                      <input type="hidden" name="subjectId" value={subject.id} />
                      <input
                        name="name"
                        defaultValue={subject.name}
                        required
                        minLength={2}
                        placeholder="Course name"
                        className={inputClass}
                      />
                      <textarea
                        name="description"
                        defaultValue={subject.description ?? ""}
                        rows={2}
                        placeholder="Short description (optional)"
                        className={cn(inputClass, "resize-y")}
                      />
                      <button type="submit" className={saveButtonClass}>
                        Save course
                      </button>
                    </form>
                  </details>
                  <DeleteButton
                    action={deleteSubject.bind(null, subject.id)}
                    confirmText={`Delete "${subject.name}"? Its topics must be empty first.`}
                  />
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {subject.topics.length === 0 && (
                  <p className="rounded-lg border border-dashed border-forest-100 px-3 py-4 text-center text-sm text-ink-soft">
                    No topics yet — add one below.
                  </p>
                )}
                {subject.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-forest-50 bg-forest-50/30 px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="w-6 shrink-0 text-center text-xs font-bold text-ink-soft">
                        {topic.order}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-forest-900">
                          {topic.title}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {topic._count.lessons} lesson{topic._count.lessons === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <details className="group">
                        <summary className={editToggleClass}>
                          <PenLine className="h-3.5 w-3.5" />
                          Edit
                        </summary>
                        <form
                          action={updateTopic}
                          className="mt-3 w-full min-w-[280px] space-y-3 rounded-xl border border-forest-100 bg-white p-4"
                        >
                          <input type="hidden" name="topicId" value={topic.id} />
                          <Select
                            name="subjectId"
                            required
                            defaultValue={subject.id}
                            placeholder="Choose a course…"
                            options={subjects.map((s) => ({ value: s.id, label: s.name }))}
                          />
                          <input
                            name="title"
                            defaultValue={topic.title}
                            required
                            minLength={2}
                            placeholder="Topic title"
                            className={inputClass}
                          />
                          <input
                            name="order"
                            type="number"
                            min={0}
                            defaultValue={topic.order}
                            placeholder="Order (0 first)"
                            className={cn(inputClass, "max-w-[160px]")}
                          />
                          <button type="submit" className={saveButtonClass}>
                            Save topic
                          </button>
                        </form>
                      </details>
                      <DeleteButton
                        action={deleteTopic.bind(null, topic.id)}
                        confirmText={`Delete "${topic.title}"? It must have no lessons.`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <details className="group mt-4">
                <summary className={editToggleClass}>
                  <Plus className="h-3.5 w-3.5" />
                  Add topic
                </summary>
                <form action={createTopic} className="mt-3 flex flex-wrap items-end gap-3 rounded-xl border border-forest-100 bg-forest-50/40 p-4">
                  <input type="hidden" name="subjectId" value={subject.id} />
                  <input
                    name="title"
                    required
                    minLength={2}
                    placeholder="Topic title, e.g. HTML & CSS Basics"
                    className={cn(inputClass, "min-w-[220px] flex-1")}
                  />
                  <input
                    name="order"
                    type="number"
                    min={0}
                    defaultValue={0}
                    placeholder="Order (0 first)"
                    className={cn(inputClass, "max-w-[160px]")}
                  />
                  <button type="submit" className={saveButtonClass}>
                    Add topic
                  </button>
                </form>
              </details>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-12">
        <div className="rounded-2xl border border-forest-100 bg-white p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-forest-950">
            <FolderPlus className="h-5 w-5 text-gold-500" />
            New course
          </h2>
          <form action={createSubject} className="mt-4 space-y-3">
            <input
              name="name"
              required
              minLength={2}
              placeholder="Course name, e.g. Web Development"
              className={inputClass}
            />
            <textarea
              name="description"
              rows={2}
              placeholder="Short description (optional)"
              className={cn(inputClass, "resize-y")}
            />
            <button type="submit" className={saveButtonClass}>
              Create course
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
