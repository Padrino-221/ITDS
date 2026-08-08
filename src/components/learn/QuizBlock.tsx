"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { QuizQuestion } from "@/lib/learn";
import { saveQuizScore } from "@/app/learn/actions";
import { cn } from "@/lib/utils";

export default function QuizBlock({
  questions,
  lessonId,
}: {
  questions: QuizQuestion[];
  lessonId: string;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    questions.map(() => null)
  );
  const [submitted, setSubmitted] = useState(false);

  const score = questions.filter((q, i) => answers[i] === q.answer).length;

  return (
    <div className="rounded-2xl border border-forest-100 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="font-display text-lg font-extrabold text-forest-950">
        Check your understanding
      </h3>
      <div className="mt-6 space-y-8">
        {questions.map((q, qi) => (
          <div key={qi}>
            <p className="font-semibold text-forest-900">
              {qi + 1}. {q.question}
            </p>
            <div className="mt-3 space-y-2">
              {q.options.map((option, oi) => {
                const selected = answers[qi] === oi;
                const isCorrect = submitted && oi === q.answer;
                const isWrong = submitted && selected && oi !== q.answer;
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={submitted}
                    onClick={() =>
                      setAnswers((prev) =>
                        prev.map((a, i) => (i === qi ? oi : a))
                      )
                    }
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-all",
                      selected && !submitted
                        ? "border-forest-500 bg-forest-50 text-forest-800"
                        : "border-forest-100 bg-white text-ink hover:border-forest-300",
                      isCorrect && "border-emerald-300 bg-emerald-50 text-emerald-800",
                      isWrong && "border-red-300 bg-red-50 text-red-700"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                        isCorrect
                          ? "border-emerald-400 text-emerald-600"
                          : isWrong
                            ? "border-red-400 text-red-600"
                            : "border-current"
                      )}
                    >
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {isCorrect && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    )}
                    {isWrong && (
                      <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-forest-100 pt-5">
        {submitted ? (
          <p className="font-bold text-forest-900">
            You scored {score} / {questions.length}
            {score === questions.length
              ? " — excellent! 🎉"
              : " — review the lesson and try again."}
          </p>
        ) : (
          <p className="text-sm text-ink-soft">Self-graded — answer then check below.</p>
        )}
        <button
          type="button"
          onClick={() => {
            if (submitted) {
              setAnswers(questions.map(() => null));
              setSubmitted(false);
            } else {
              setSubmitted(true);
              // Persist the best score for signed-in learners (no-op when anonymous).
              void saveQuizScore(lessonId, score, questions.length);
            }
          }}
          className="rounded-lg bg-forest-950 px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lg"
        >
          {submitted ? "Try again" : "Check answers"}
        </button>
      </div>
    </div>
  );
}
