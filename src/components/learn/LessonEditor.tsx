"use client";

import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Code2,
  Dumbbell,
  Heading2,
  List,
  MonitorPlay,
  Plus,
  Quote,
  Send,
  Target,
  Trash2,
} from "lucide-react";
import type { ContentBlock, QuizQuestion } from "@/lib/learn";
import { saveLesson } from "@/app/learn/actions";
import { cn } from "@/lib/utils";
import { inputClass } from "@/lib/styles";
import { Select } from "@/components/admin/Dropdown";

type EditorLesson = {
  id: string;
  title: string;
  objective: string;
  contentBody: ContentBlock[];
  hasPlayground: boolean;
  playgroundLang: string | null;
  starterCode: string | null;
  exercisePrompt: string | null;
  quiz: QuizQuestion[] | null;
  status: string;
  reviewNote: string | null;
  subjectName: string;
  topicTitle: string;
};

const LANGUAGES = [
  "python",
  "javascript",
  "typescript",
  "html",
  "css",
  "java",
  "c",
  "cpp",
  "php",
  "bash",
];

const LANGUAGE_LABELS: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  html: "HTML",
  css: "CSS",
  java: "Java",
  c: "C",
  cpp: "C++",
  php: "PHP",
  bash: "Bash",
};

function makeBlock(type: ContentBlock["type"]): ContentBlock {
  switch (type) {
    case "heading":
      return { type, text: "", level: 2 };
    case "paragraph":
      return { type, text: "" };
    case "code":
      return { type, code: "", language: "" };
    case "list":
      return { type, items: [""] };
  }
}

const blockIcons: Record<ContentBlock["type"], React.ReactNode> = {
  heading: <Heading2 className="h-4 w-4" />,
  paragraph: <Quote className="h-4 w-4" />,
  code: <Code2 className="h-4 w-4" />,
  list: <List className="h-4 w-4" />,
};

const blockLabels: Record<ContentBlock["type"], string> = {
  heading: "Heading",
  paragraph: "Paragraph",
  code: "Code block",
  list: "Bullet list",
};

function SectionCard({
  step,
  icon,
  title,
  hint,
  children,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-forest-100 bg-white p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500 font-display text-sm font-extrabold text-white">
          {step}
        </span>
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-forest-950">
            {icon}
            {title}
          </h2>
          {hint && <p className="mt-0.5 text-xs text-ink-soft">{hint}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function LessonEditor({ lesson }: { lesson: EditorLesson }) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    Array.isArray(lesson.contentBody) ? lesson.contentBody : []
  );
  const [quiz, setQuiz] = useState<QuizQuestion[]>(
    Array.isArray(lesson.quiz) ? lesson.quiz : []
  );
  const [hasPlayground, setHasPlayground] = useState(lesson.hasPlayground);

  const formRef = useRef<HTMLFormElement>(null);
  const contentBodyRef = useRef<HTMLInputElement>(null);
  const quizRef = useRef<HTMLInputElement>(null);
  const submitReviewRef = useRef<HTMLInputElement>(null);
  const serializedRef = useRef(false);

  const locked = lesson.status === "IN_REVIEW";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (serializedRef.current) {
      serializedRef.current = false;
      return;
    }
    e.preventDefault();
    // Detect which button was pressed so the server can save-only or
    // save-and-submit — set fresh on every submit to avoid stale flags.
    const submitter = (e.nativeEvent as SubmitEvent).submitter as
      | HTMLButtonElement
      | null;
    submitReviewRef.current!.value =
      submitter?.getAttribute("data-submit-review") === "true" ? "on" : "";
    contentBodyRef.current!.value = JSON.stringify(blocks);
    quizRef.current!.value = JSON.stringify(quiz);
    serializedRef.current = true;
    formRef.current?.requestSubmit();
  }

  function updateBlock(i: number, patch: Partial<ContentBlock>) {
    setBlocks((b) => b.map((blk, j) => (j === i ? ({ ...blk, ...patch } as ContentBlock) : blk)));
  }

  function addBlock(type: ContentBlock["type"]) {
    setBlocks((b) => [...b, makeBlock(type)]);
  }

  function moveBlock(i: number, dir: -1 | 1) {
    setBlocks((b) => {
      const next = [...b];
      const j = i + dir;
      if (j < 0 || j >= next.length) return b;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function addQuestion() {
    setQuiz((q) => [...q, { question: "", options: ["", "", "", ""], answer: 0 }]);
  }

  function updateQuestion(i: number, patch: Partial<QuizQuestion>) {
    setQuiz((q) => q.map((qq, j) => (j === i ? { ...qq, ...patch } : qq)));
  }

  return (
    <form ref={formRef} action={saveLesson.bind(null, lesson.id)} onSubmit={handleSubmit}>
      <input type="hidden" name="contentBody" ref={contentBodyRef} />
      <input type="hidden" name="quiz" ref={quizRef} />
      <input type="hidden" name="submitReview" ref={submitReviewRef} />

      {/* Status banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-forest-100 bg-white px-5 py-4">
        <div className="text-sm">
          <span className="text-ink-soft">Lesson in </span>
          <span className="font-bold uppercase tracking-wide text-forest-800">
            {lesson.topicTitle} · {lesson.subjectName}
          </span>
        </div>
        <span
          className={cn(
            "rounded-lg px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
            lesson.status === "PUBLISHED"
              ? "bg-emerald-50 text-emerald-700"
              : lesson.status === "IN_REVIEW"
                ? "bg-gold-50 text-gold-600"
                : lesson.status === "CHANGES_REQUESTED"
                  ? "bg-red-50 text-red-600"
                  : "bg-stone-100 text-stone-600"
          )}
        >
          {lesson.status.replace("_", " ")}
        </span>
      </div>

      {lesson.status === "CHANGES_REQUESTED" && lesson.reviewNote && (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm font-medium text-red-700">
          <strong>Reviewer&apos;s note:</strong> {lesson.reviewNote}
        </p>
      )}

      {lesson.status === "PUBLISHED" && (
        <p className="mb-6 rounded-xl border border-gold-200 bg-gold-50 px-5 py-3.5 text-sm font-medium text-gold-700">
          This lesson is <strong>live</strong>. Saving will create a draft revision —
          students keep seeing the current published version until your revision is
          approved.
        </p>
      )}

      {locked && (
        <p className="mb-6 rounded-xl border border-gold-200 bg-gold-50 px-5 py-3.5 text-sm font-medium text-gold-700">
          This lesson is awaiting review and cannot be edited right now.
        </p>
      )}

      <fieldset disabled={locked} className="space-y-6 disabled:opacity-70">
        {/* 1. Title */}
        <SectionCard step={1} icon={<Heading2 className="h-5 w-5 text-gold-500" />} title="Title">
          <input
            name="title"
            required
            minLength={3}
            defaultValue={lesson.title}
            placeholder="e.g. Your First Web Page"
            className={inputClass}
          />
        </SectionCard>

        {/* 2. Objective */}
        <SectionCard
          step={2}
          icon={<Target className="h-5 w-5 text-gold-500" />}
          title="Learning objective"
          hint="One sentence: what the student will be able to do after this lesson."
        >
          <textarea
            name="objective"
            required
            rows={2}
            defaultValue={lesson.objective}
            placeholder="By the end of this lesson, you will be able to…"
            className={cn(inputClass, "resize-y")}
          />
        </SectionCard>

        {/* 3. Content body */}
        <SectionCard
          step={3}
          icon={<Quote className="h-5 w-5 text-gold-500" />}
          title="Content body"
          hint="Explain the concept in structured blocks — headings, paragraphs, code and lists."
        >
          <div className="space-y-3">
            {blocks.map((block, i) => (
              <div
                key={i}
                className="group rounded-xl border border-forest-100 bg-forest-50/40 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-soft">
                    {blockIcons[block.type]} {blockLabels[block.type]}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveBlock(i, -1)}
                      disabled={i === 0}
                      className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-white hover:text-forest-800 disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(i, 1)}
                      disabled={i === blocks.length - 1}
                      className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-white hover:text-forest-800 disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlocks((b) => b.filter((_, j) => j !== i))}
                      className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove block"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {block.type === "heading" && (
                    <div className="flex gap-2">
                      <input
                        value={(block as { text: string }).text}
                        onChange={(e) => updateBlock(i, { text: e.target.value })}
                        placeholder="Heading text"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateBlock(i, {
                            level: (block as { level?: number }).level === 2 ? 3 : 2,
                          })
                        }
                        className="shrink-0 rounded-lg border border-forest-200 bg-white px-3 text-xs font-bold text-ink-soft transition-colors hover:border-forest-400"
                      >
                        {(block as { level?: number }).level === 2 ? "H2" : "H3"}
                      </button>
                    </div>
                  )}
                  {block.type === "paragraph" && (
                    <textarea
                      value={(block as { text: string }).text}
                      onChange={(e) => updateBlock(i, { text: e.target.value })}
                      rows={3}
                      placeholder="Paragraph text…"
                      className={cn(inputClass, "resize-y")}
                    />
                  )}
                  {block.type === "code" && (
                    <div className="space-y-2">
                      <input
                        value={(block as { language?: string }).language ?? ""}
                        onChange={(e) => updateBlock(i, { language: e.target.value })}
                        placeholder="Language (e.g. python)"
                        className={cn(inputClass, "max-w-[200px]")}
                      />
                      <textarea
                        value={(block as { code: string }).code}
                        onChange={(e) => updateBlock(i, { code: e.target.value })}
                        rows={5}
                        placeholder="Code…"
                        spellCheck={false}
                        className="w-full rounded-lg border border-forest-800 bg-forest-950 p-3.5 font-mono text-[13px] text-emerald-100 placeholder:text-emerald-100/40 outline-none focus:ring-2 focus:ring-gold-500/40"
                      />
                    </div>
                  )}
                  {block.type === "list" && (
                    <div className="space-y-2">
                      {(block as { items: string[] }).items.map((item, j) => (
                        <div key={j} className="flex gap-2">
                          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                          <input
                            value={item}
                            onChange={(e) =>
                              updateBlock(i, {
                                items: (block as { items: string[] }).items.map((it, k) =>
                                  k === j ? e.target.value : it
                                ),
                              })
                            }
                            placeholder="List item"
                            className={inputClass}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateBlock(i, {
                                items: (block as { items: string[] }).items.filter(
                                  (_, k) => k !== j
                                ),
                              })
                            }
                            className="shrink-0 rounded-md p-1.5 text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          updateBlock(i, {
                            items: [...(block as { items: string[] }).items, ""],
                          })
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-600 hover:text-gold-700"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add item
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add block */}
            <div className="flex flex-wrap gap-2 pt-1">
              {(["paragraph", "heading", "code", "list"] as ContentBlock["type"][]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addBlock(type)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 bg-white px-3 py-2 text-xs font-bold text-ink-soft transition-all hover:-translate-y-0.5 hover:border-gold-400 hover:text-gold-700 hover:shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {blockLabels[type]}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* 4. Worked example / playground */}
        <SectionCard
          step={4}
          icon={<MonitorPlay className="h-5 w-5 text-gold-500" />}
          title="Code playground"
          hint="Optional — programming lessons get an embedded runnable editor (Phase 2)."
        >
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="hasPlayground"
              checked={hasPlayground}
              onChange={(e) => setHasPlayground(e.target.checked)}
              className="h-4 w-4 rounded border-forest-300 accent-gold-500"
            />
            <span className="text-sm font-semibold text-forest-900">
              Include a code playground with starter code
            </span>
          </label>
          {hasPlayground && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Language
                </label>
                <Select
                  name="playgroundLang"
                  defaultValue={lesson.playgroundLang ?? "python"}
                  options={LANGUAGES.map((lang) => ({ value: lang, label: LANGUAGE_LABELS[lang] ?? lang }))}
                  className="max-w-[220px]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Starter code
                </label>
                <textarea
                  name="starterCode"
                  rows={6}
                  defaultValue={lesson.starterCode ?? ""}
                  placeholder="print('Hello, world!')"
                  spellCheck={false}
                  className="w-full rounded-lg border border-forest-800 bg-forest-950 p-3.5 font-mono text-[13px] text-emerald-100 placeholder:text-emerald-100/40 outline-none focus:ring-2 focus:ring-gold-500/40"
                />
              </div>
            </div>
          )}
        </SectionCard>

        {/* 5. Practice exercise */}
        <SectionCard
          step={5}
          icon={<Dumbbell className="h-5 w-5 text-gold-500" />}
          title="Practice exercise"
          hint="Optional — a self-check prompt students work through."
        >
          <textarea
            name="exercisePrompt"
            rows={4}
            defaultValue={lesson.exercisePrompt ?? ""}
            placeholder="Try this: …"
            className={cn(inputClass, "resize-y")}
          />
        </SectionCard>

        {/* 6. Quiz */}
        <SectionCard
          step={6}
          icon={<List className="h-5 w-5 text-gold-500" />}
          title="Quiz / check for understanding"
          hint="Optional — 1–3 short questions, self-graded for the student."
        >
          <div className="space-y-5">
            {quiz.map((q, qi) => (
              <div key={qi} className="rounded-xl border border-forest-100 bg-forest-50/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                    Question {qi + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuiz((qq) => qq.filter((_, j) => j !== qi))}
                    className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove question"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <input
                  value={q.question}
                  onChange={(e) => updateQuestion(qi, { question: e.target.value })}
                  placeholder="Question…"
                  className={cn(inputClass, "mt-3")}
                />
                <div className="mt-3 space-y-2">
                  {q.options.map((option, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`answer-${qi}`}
                        checked={q.answer === oi}
                        onChange={() => updateQuestion(qi, { answer: oi })}
                        className="h-4 w-4 accent-gold-500"
                        aria-label={`Mark option ${oi + 1} as correct`}
                      />
                      <input
                        value={option}
                        onChange={(e) =>
                          updateQuestion(qi, {
                            options: q.options.map((o, k) => (k === oi ? e.target.value : o)),
                          })
                        }
                        placeholder={`Option ${oi + 1}`}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateQuestion(qi, {
                            options: q.options.filter((_, k) => k !== oi),
                            answer:
                              q.answer === oi
                                ? 0
                                : q.answer > oi
                                  ? q.answer - 1
                                  : q.answer,
                          })
                        }
                        disabled={q.options.length <= 2}
                        className="shrink-0 rounded-md p-1.5 text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                        aria-label="Remove option"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => updateQuestion(qi, { options: [...q.options, ""] })}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-gold-600 hover:text-gold-700"
                >
                  <Plus className="h-3.5 w-3.5" /> Add option
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 bg-white px-3 py-2 text-xs font-bold text-ink-soft transition-all hover:-translate-y-0.5 hover:border-gold-400 hover:text-gold-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add question
            </button>
          </div>
        </SectionCard>
      </fieldset>

      {/* Actions */}
      {!locked && (
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-forest-950 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lg"
          >
            Save draft
          </button>
          <button
            type="submit"
            data-submit-review="true"
            className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-gold-600 hover:shadow-lg hover:shadow-gold-500/25"
          >
            <Send className="h-4 w-4" />
            {lesson.status === "PUBLISHED"
              ? "Submit revision for review"
              : "Submit for review"}
          </button>
        </div>
      )}
    </form>
  );
}
