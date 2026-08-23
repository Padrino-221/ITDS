"use client";

import { useRef, useState } from "react";
import {
  Code2,
  GripVertical,
  ListChecks,
  Plus,
  Save,
  Trash2,
  ToggleLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { inputClass } from "@/lib/styles";
import { saveExam } from "@/app/learn/actions";

type ExamQuestionType = "MC" | "TF" | "CODE";

type Question = {
  type: ExamQuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  codeLanguage?: string;
  codeTemplate?: string;
};

type ExistingQuestion = {
  id: string;
  type: ExamQuestionType;
  question: string;
  options: unknown;
  correctAnswer: string;
  codeLanguage: string | null;
  codeTemplate: string | null;
  order: number;
};

type ExamData = {
  id: string | null;
  topicId: string;
  title: string;
  description: string | null;
  timeLimit: number | null;
  passScore: number;
  published: boolean;
  questions: ExistingQuestion[];
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

const QUESTION_TYPE_CONFIG: Record<
  ExamQuestionType,
  { label: string; icon: React.ReactNode }
> = {
  MC: { label: "Multiple Choice", icon: <ListChecks className="h-4 w-4" /> },
  TF: { label: "True / False", icon: <ToggleLeft className="h-4 w-4" /> },
  CODE: { label: "Code Exercise", icon: <Code2 className="h-4 w-4" /> },
};

function makeQuestion(type: ExamQuestionType): Question {
  switch (type) {
    case "MC":
      return { type, question: "", options: ["", "", "", ""], correctAnswer: "0" };
    case "TF":
      return { type, question: "", correctAnswer: "True" };
    case "CODE":
      return {
        type,
        question: "",
        correctAnswer: "",
        codeLanguage: "python",
        codeTemplate: "",
      };
  }
}

function QuestionEditor({
  q,
  index,
  onChange,
  onRemove,
}: {
  q: Question;
  index: number;
  onChange: (patch: Partial<Question>) => void;
  onRemove: () => void;
}) {
  const config = QUESTION_TYPE_CONFIG[q.type];

  return (
    <div className="rounded-xl border border-forest-100 bg-forest-50/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-soft">
          {config.icon}
          Q{index + 1} · {config.label}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600"
          aria-label="Remove question"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <input
        value={q.question}
        onChange={(e) => onChange({ question: e.target.value })}
        placeholder="Question text…"
        className={cn(inputClass, "mt-3")}
      />

      {q.type === "MC" && (
        <div className="mt-3 space-y-2">
          {(q.options ?? []).map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${index}`}
                checked={q.correctAnswer === String(oi)}
                onChange={() => onChange({ correctAnswer: String(oi) })}
                className="h-4 w-4 accent-gold-500"
                aria-label={`Mark option ${oi + 1} as correct`}
              />
              <input
                value={opt}
                onChange={(e) => {
                  const newOpts = [...(q.options ?? [])];
                  newOpts[oi] = e.target.value;
                  onChange({ options: newOpts });
                }}
                placeholder={`Option ${oi + 1}`}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => {
                  const newOpts = (q.options ?? []).filter((_, k) => k !== oi);
                  const newCorrect =
                    q.correctAnswer === String(oi)
                      ? "0"
                      : Number(q.correctAnswer) > oi
                        ? String(Number(q.correctAnswer) - 1)
                        : q.correctAnswer;
                  onChange({ options: newOpts, correctAnswer: newCorrect });
                }}
                disabled={(q.options ?? []).length <= 2}
                className="shrink-0 rounded-md p-1.5 text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ options: [...(q.options ?? []), ""] })}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-600 hover:text-gold-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add option
          </button>
        </div>
      )}

      {q.type === "TF" && (
        <div className="mt-3 flex gap-3">
          {["True", "False"].map((val) => (
            <label
              key={val}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors",
                q.correctAnswer === val
                  ? "border-gold-400 bg-gold-50 text-gold-700"
                  : "border-forest-200 bg-white text-ink-soft hover:border-gold-300"
              )}
            >
              <input
                type="radio"
                name={`tf-${index}`}
                checked={q.correctAnswer === val}
                onChange={() => onChange({ correctAnswer: val })}
                className="sr-only"
              />
              {val}
            </label>
          ))}
        </div>
      )}

      {q.type === "CODE" && (
        <div className="mt-3 space-y-2">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                Language
              </label>
              <select
                value={q.codeLanguage ?? "python"}
                onChange={(e) => onChange({ codeLanguage: e.target.value })}
                className={inputClass}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {LANGUAGE_LABELS[lang] ?? lang}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
              Starter code
            </label>
            <textarea
              value={q.codeTemplate ?? ""}
              onChange={(e) => onChange({ codeTemplate: e.target.value })}
              rows={4}
              placeholder="# Starter code for the student…"
              spellCheck={false}
              className="w-full rounded-lg border border-forest-800 bg-forest-950 p-3.5 font-mono text-[13px] text-emerald-100 placeholder:text-emerald-100/40 outline-none focus:ring-2 focus:ring-gold-500/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
              Expected output (exact match)
            </label>
            <textarea
              value={q.correctAnswer}
              onChange={(e) => onChange({ correctAnswer: e.target.value })}
              rows={2}
              placeholder="The expected stdout output…"
              spellCheck={false}
              className={cn(inputClass, "font-mono text-sm")}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamEditor({
  exam,
  topicId,
  topicTitle,
  subjectName,
}: {
  exam: ExamData;
  topicId: string;
  topicTitle: string;
  subjectName: string;
}) {
  const [questions, setQuestions] = useState<Question[]>(
    exam.questions.map((q) => ({
      type: q.type,
      question: q.question,
      options: Array.isArray(q.options) ? q.options : q.type === "TF" ? ["True", "False"] : undefined,
      correctAnswer: q.correctAnswer,
      codeLanguage: q.codeLanguage ?? undefined,
      codeTemplate: q.codeTemplate ?? undefined,
    }))
  );

  const formRef = useRef<HTMLFormElement>(null);
  const questionsRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    questionsRef.current!.value = JSON.stringify(questions);
    formRef.current?.requestSubmit();
  }

  return (
    <form
      ref={formRef}
      action={saveExam.bind(null, topicId)}
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="questions" ref={questionsRef} />

      <div className="space-y-6">
        {/* Topic info */}
        <div className="rounded-xl border border-forest-100 bg-white px-5 py-4">
          <p className="text-sm text-ink-soft">
            Exam for{" "}
            <span className="font-bold text-forest-900">{topicTitle}</span> in{" "}
            <span className="font-bold text-forest-900">{subjectName}</span>
          </p>
        </div>

        {/* Basic settings */}
        <div className="rounded-2xl border border-forest-100 bg-white p-6">
          <h2 className="font-display text-lg font-extrabold text-forest-950">
            Exam Settings
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                Title
              </label>
              <input
                name="title"
                required
                minLength={3}
                defaultValue={exam.title}
                placeholder="e.g. Topic 1 Assessment"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                Description (optional)
              </label>
              <textarea
                name="description"
                rows={2}
                defaultValue={exam.description ?? ""}
                placeholder="Brief description of what this exam covers…"
                className={cn(inputClass, "resize-y")}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                Time limit (minutes)
              </label>
              <input
                name="timeLimit"
                type="number"
                min={1}
                max={300}
                defaultValue={exam.timeLimit ?? ""}
                placeholder="No limit"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-ink-soft">
                Leave empty for no time limit.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                Pass score (%)
              </label>
              <input
                name="passScore"
                type="number"
                min={0}
                max={100}
                defaultValue={exam.passScore}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={exam.published}
                  className="h-4 w-4 rounded border-forest-300 accent-gold-500"
                />
                <span className="text-sm font-semibold text-forest-900">
                  Publish exam (visible to learners)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="rounded-2xl border border-forest-100 bg-white p-6">
          <h2 className="font-display text-lg font-extrabold text-forest-950">
            Questions ({questions.length})
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Add multiple choice, true/false, or code exercise questions.
          </p>

          <div className="mt-4 space-y-4">
            {questions.map((q, i) => (
              <QuestionEditor
                key={i}
                q={q}
                index={i}
                onChange={(patch) =>
                  setQuestions((qs) =>
                    qs.map((qq, j) => (j === i ? { ...qq, ...patch } : qq))
                  )
                }
                onRemove={() =>
                  setQuestions((qs) => qs.filter((_, j) => j !== i))
                }
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(["MC", "TF", "CODE"] as ExamQuestionType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setQuestions((qs) => [...qs, makeQuestion(type)])}
                className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 bg-white px-3 py-2 text-xs font-bold text-ink-soft transition-all hover:-translate-y-0.5 hover:border-gold-400 hover:text-gold-700 hover:shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                {QUESTION_TYPE_CONFIG[type].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-3">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-forest-950 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lg"
        >
          <Save className="h-4 w-4" />
          Save exam
        </button>
      </div>
    </form>
  );
}
