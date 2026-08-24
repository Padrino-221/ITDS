"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Code2,
  ListChecks,
  Send,
  ToggleLeft,
  XCircle,
} from "lucide-react";
import { cn, learnUrl } from "@/lib/utils";
import { startExamAttempt, submitExamAttempt } from "@/app/learn/actions";

type ExamQuestion = {
  id: string;
  type: "MC" | "TF" | "CODE";
  question: string;
  options: unknown;
  codeLanguage: string | null;
  codeTemplate: string | null;
  order: number;
};

type ExamInfo = {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number | null;
  passScore: number;
  questions: ExamQuestion[];
  topic: { title: string; subject: { name: string } };
};

type Answers = Record<string, string>;

const QUESTION_ICONS: Record<string, React.ReactNode> = {
  MC: <ListChecks className="h-4 w-4" />,
  TF: <ToggleLeft className="h-4 w-4" />,
  CODE: <Code2 className="h-4 w-4" />,
};

const QUESTION_TYPE_LABELS: Record<string, string> = {
  MC: "Multiple Choice",
  TF: "True / False",
  CODE: "Code Exercise",
};

export default function ExamTaker({
  exam,
  subjectSlug,
}: {
  exam: ExamInfo;
  subjectSlug: string;
}) {
  const router = useRouter();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    total: number;
    correct: number;
  } | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [startError, setStartError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // null = still checking, false = guest, true = signed-in learner
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // The exam page itself is public (browse-before-signing-up), so detect the
  // session client-side to swap "Start Exam" for a sign-in prompt for guests.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/learn/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setSignedIn(Boolean(d?.user));
      })
      .catch(() => {
        if (!cancelled) setSignedIn(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Timer
  useEffect(() => {
    if (!started || timeLeft === null || result) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => (t ?? 0) - 1), 1000);
    return () => clearInterval(timer);
  }, [started, timeLeft, result]);

  async function handleStart() {
    setStartError(null);
    try {
      const res = await startExamAttempt(exam.id);
      setAttemptId(res.attemptId);
      setStarted(true);
      // Use the server-provided startedAt so the timer is accurate on resume.
      const serverStarted = new Date(res.startedAt).getTime();
      startTimeRef.current = serverStarted;
      if (exam.timeLimit) {
        const elapsedSec = Math.floor((Date.now() - serverStarted) / 1000);
        const remaining = Math.max(0, exam.timeLimit * 60 - elapsedSec);
        setTimeLeft(remaining);
      }
    } catch {
      // Session-expiry redirects are handled by the router; anything reaching
      // this catch is a real failure (rate limit, exam unpublished, network).
      setStartError("We couldn't start the exam. Please refresh the page and try again.");
    }
  }

  async function handleSubmit() {
    if (submitting || result || !attemptId) return;
    setSubmitting(true);
    setSubmitError(null);
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const formData = new FormData();
    formData.append(
      "answers",
      JSON.stringify(
        Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        }))
      )
    );
    formData.append("timeSpent", String(timeSpent));
    try {
      const res = await submitExamAttempt(attemptId, formData);
      setResult(res);
    } catch {
      // Server actions that redirect (e.g. expired session) throw through
      // here too — Next handles the redirect; anything else is a real error.
      setSubmitError("We couldn't submit your exam. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Retake must fully reset local state — router.refresh() alone re-renders
  // server components but leaves this client component stuck on the result.
  function handleRetake() {
    setResult(null);
    setStarted(false);
    setAttemptId(null);
    setAnswers({});
    setCurrentQ(0);
    setTimeLeft(null);
    setSubmitting(false);
    setSubmitError(null);
    setStartError(null);
    router.refresh();
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // Result screen
  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div
          className={cn(
            "mx-auto flex h-20 w-20 items-center justify-center rounded-full",
            result.passed ? "bg-emerald-100" : "bg-red-100"
          )}
        >
          {result.passed ? (
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          ) : (
            <XCircle className="h-10 w-10 text-red-500" />
          )}
        </div>
        <h1 className="mt-6 font-display text-3xl font-extrabold text-forest-950">
          {result.passed ? "Congratulations!" : "Keep Practicing"}
        </h1>
        <p className="mt-2 text-lg text-ink-soft">
          You scored{" "}
          <span className="font-bold text-forest-900">
            {result.correct}/{result.total}
          </span>{" "}
          ({result.score}%)
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          {result.passed
            ? `You passed! (Required: ${exam.passScore}%)`
            : `You needed ${exam.passScore}% to pass.`}
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={handleRetake}
            className="rounded-xl border border-forest-200 bg-white px-6 py-3 text-sm font-bold text-forest-900 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            Retake Exam
          </button>
          <button
            onClick={() => router.push(`/learn/${subjectSlug}`)}
            className="rounded-xl bg-forest-950 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lg"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  // Pre-start screen
  if (!started) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-forest-100 bg-white p-8 text-center">
          <h1 className="font-display text-2xl font-extrabold text-forest-950">
            {exam.title}
          </h1>
          {exam.description && (
            <p className="mt-2 text-sm text-ink-soft">{exam.description}</p>
          )}
          <div className="mt-6 flex justify-center gap-6 text-sm text-ink-soft">
            <span className="flex items-center gap-1.5">
              <ListChecks className="h-4 w-4" />
              {exam.questions.length} questions
            </span>
            {exam.timeLimit && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {exam.timeLimit} minutes
              </span>
            )}
            <span>Pass: {exam.passScore}%</span>
          </div>
          {startError && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
              {startError}
            </p>
          )}
          {signedIn === false ? (
            <div className="mt-8">
              <p className="text-sm leading-relaxed text-ink-soft">
                You&apos;ll need a free learner account to take this exam,
                track your score, and earn a certificate.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  href={learnUrl("/account/signin")}
                  className="rounded-xl bg-gold-500 px-8 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-gold-600 hover:shadow-lg hover:shadow-gold-500/25"
                >
                  Sign in to take this exam
                </Link>
                <Link
                  href={learnUrl("/account/register")}
                  className="rounded-xl border border-forest-200 bg-white px-8 py-3.5 text-sm font-bold text-forest-900 transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-lg"
                >
                  Create an account
                </Link>
              </div>
            </div>
          ) : (
            <button
              onClick={handleStart}
              className="mt-8 rounded-xl bg-gold-500 px-8 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-gold-600 hover:shadow-lg hover:shadow-gold-500/25"
            >
              Start Exam
            </button>
          )}
        </div>
      </div>
    );
  }

  const q = exam.questions[currentQ];
  const mcOptions = Array.isArray(q?.options) ? (q.options as string[]) : [];
  const total = exam.questions.length;
  // All questions are scorable now (CODE runs server-side); the counter is
  // cosmetic and simply reflects answered questions.
  const answeredCount = Object.keys(answers).filter((id) =>
    exam.questions.some((qq) => qq.id === id)
  ).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      {/* Header bar */}
      <div className="sticky top-0 z-10 -mx-4 flex items-center justify-between border-b border-forest-100 bg-paper px-4 py-3 sm:-mx-6 sm:px-6">
        <div className="text-sm font-bold text-forest-900">
          Q{currentQ + 1} / {total}
        </div>
        {timeLeft !== null && (
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold tabular-nums",
              timeLeft < 60
                ? "bg-red-50 text-red-600"
                : timeLeft < 300
                  ? "bg-gold-50 text-gold-600"
                  : "bg-forest-50 text-forest-700"
            )}
          >
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        )}
        <div className="text-xs text-ink-soft">
          {answeredCount}/{total} answered
        </div>
      </div>

      {/* Question */}
      {q && (
        <div className="mt-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-soft">
            {QUESTION_ICONS[q.type]}
            {QUESTION_TYPE_LABELS[q.type]}
          </div>
          <h2 className="mt-3 text-lg font-bold text-forest-950">{q.question}</h2>

          {/* MC options */}
          {q.type === "MC" && (
            <div className="mt-4 space-y-2">
              {mcOptions.map((opt, oi) => (
                <label
                  key={oi}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all",
                    answers[q.id] === String(oi)
                      ? "border-gold-400 bg-gold-50"
                      : "border-forest-100 bg-white hover:border-gold-300"
                  )}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === String(oi)}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: String(oi) }))}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                      answers[q.id] === String(oi)
                        ? "border-gold-500 bg-gold-500 text-white"
                        : "border-forest-200 text-ink-soft"
                    )}
                  >
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span className="text-sm font-medium text-forest-900">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {/* TF options */}
          {q.type === "TF" && (
            <div className="mt-4 flex gap-3">
              {["True", "False"].map((val) => (
                <label
                  key={val}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-xl border px-6 py-4 text-sm font-semibold transition-all",
                    answers[q.id] === val
                      ? "border-gold-400 bg-gold-50 text-gold-700"
                      : "border-forest-100 bg-white text-ink-soft hover:border-gold-300"
                  )}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === val}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: val }))}
                    className="sr-only"
                  />
                  {val}
                </label>
              ))}
            </div>
          )}

          {/* CODE — student writes code; the server executes it and grades
              the program's output */}
          {q.type === "CODE" && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                Your solution ({q.codeLanguage ?? "code"}) — write code whose
                output matches what is asked
              </label>
              <textarea
                value={answers[q.id] ?? q.codeTemplate ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                rows={10}
                spellCheck={false}
                className="w-full rounded-lg border border-forest-800 bg-forest-950 p-3.5 font-mono text-[13px] leading-relaxed text-emerald-100 outline-none focus:ring-2 focus:ring-gold-500/40"
              />
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      {submitError && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
          {submitError}
        </p>
      )}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
          disabled={currentQ === 0}
          className="rounded-xl border border-forest-200 bg-white px-5 py-2.5 text-sm font-bold text-ink-soft transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-30"
        >
          Previous
        </button>

        {currentQ < total - 1 ? (
          <button
            onClick={() => setCurrentQ((c) => Math.min(total - 1, c + 1))}
            className="rounded-xl bg-forest-950 px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lg"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-gold-600 hover:shadow-lg hover:shadow-gold-500/25 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Submitting…" : "Submit Exam"}
          </button>
        )}
      </div>

      {/* Question navigator dots */}
      <div className="mt-6 flex flex-wrap justify-center gap-1.5">
        {exam.questions.map((qq, i) => (
          <button
            key={qq.id}
            onClick={() => setCurrentQ(i)}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-colors",
              i === currentQ
                ? "bg-gold-500"
                : answers[qq.id]
                  ? "bg-forest-400"
                  : "bg-forest-200"
            )}
            aria-label={`Go to question ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
