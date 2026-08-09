"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ListChecks, SignpostBig } from "lucide-react";
import { toggleLessonComplete } from "@/app/learn/actions";
import { cn, learnUrl } from "@/lib/utils";

export type TopicLesson = { id: string; slug: string; title: string };

/**
 * Lesson-page sidebar (client). Fetches the session + completed lesson ids
 * through the learn API so the page itself can stay statically rendered.
 */
export default function LessonProgress({
  lessonId,
  activeLessonId,
  topicLessons,
  subjectSlug,
  topicSlug,
}: {
  lessonId: string;
  activeLessonId: string;
  topicLessons: TopicLesson[];
  subjectSlug: string;
  topicSlug: string;
}) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const [sessionRes, progressRes] = await Promise.all([
        fetch("/api/learn/session", { cache: "no-store" }),
        fetch("/api/learn/progress", { cache: "no-store" }),
      ]);
      const session = (await sessionRes.json()) as { user?: unknown };
      const progress = (await progressRes.json()) as { completedIds?: string[] };
      if (!mountedRef.current) return;
      setSignedIn(Boolean(session?.user));
      setCompletedIds(new Set(progress?.completedIds ?? []));
    } catch {
      if (!mountedRef.current) return;
      setSignedIn(false);
      setCompletedIds(new Set());
    } finally {
      if (mountedRef.current) setReady(true);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // refresh() only calls setState after its awaited fetches resolve, so
    // nothing is set synchronously — the rule can't prove that statically.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  const done = topicLessons.filter((l) => completedIds.has(l.id)).length;
  const pct = topicLessons.length ? Math.round((done / topicLessons.length) * 100) : 0;
  const isCompleted = completedIds.has(lessonId);

  async function onToggle() {
    setSaving(true);
    try {
      await toggleLessonComplete(lessonId);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  if (!ready) {
    return (
      <div className="space-y-5" aria-hidden>
        <div className="h-36 animate-pulse rounded-2xl bg-forest-100/70" />
        <div className="h-64 animate-pulse rounded-2xl bg-forest-100/70" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="rounded-2xl border border-forest-100 bg-white p-5">
        <h3 className="flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-wider text-forest-950">
          <ListChecks className="h-4 w-4 text-gold-500" />
          Progress
        </h3>
        {signedIn ? (
          <>
            <div className="mt-4 flex items-baseline justify-between text-sm">
              <span className="font-bold text-forest-900">
                {done} / {topicLessons.length}
              </span>
              <span className="text-xs font-semibold text-ink-soft">
                {pct}% of this topic
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-forest-100">
              <div
                className="h-full rounded-full bg-gold-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <button
              type="button"
              onClick={onToggle}
              disabled={saving}
              className={cn(
                "mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60",
                isCompleted
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:shadow-emerald-500/20"
                  : "bg-forest-950 text-white hover:bg-forest-800"
              )}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Mark as incomplete
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4" /> Mark lesson complete
                </>
              )}
            </button>
          </>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            <Link
              href={learnUrl("/account/signin")}
              className="font-bold text-gold-600 hover:text-gold-700"
            >
              Sign in
            </Link>{" "}
            to track your progress across lessons.
          </p>
        )}
      </div>

      {/* Topic lessons */}
      <div className="rounded-2xl border border-forest-100 bg-white p-5">
        <h3 className="flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-wider text-forest-950">
          <SignpostBig className="h-4 w-4 text-gold-500" />
          Topic lessons
        </h3>
        <ol className="mt-4 space-y-1">
          {topicLessons.map((l) => {
            const active = l.id === activeLessonId;
            const complete = signedIn && completedIds.has(l.id);
            return (
              <li key={l.id}>
                <Link
                  href={learnUrl(`/${subjectSlug}/${topicSlug}/${l.slug}`)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-forest-950 text-white"
                      : "text-ink-soft hover:bg-forest-50 hover:text-forest-900"
                  )}
                >
                  {complete ? (
                    <CheckCircle2
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active ? "text-emerald-400" : "text-emerald-600"
                      )}
                    />
                  ) : (
                    <Circle
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active ? "text-white/50" : "text-forest-200"
                      )}
                    />
                  )}
                  <span className="min-w-0 flex-1 truncate">{l.title}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
