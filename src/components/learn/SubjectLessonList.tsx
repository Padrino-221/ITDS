"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpenCheck, CheckCircle2, ClipboardList, PlayCircle } from "lucide-react";
import { learnUrl } from "@/lib/utils";

type Lesson = { id: string; slug: string; title: string };
type Exam = { id: string; title: string; published: boolean } | null;
type Topic = { id: string; title: string; slug: string; lessons: Lesson[]; exam: Exam };

export default function SubjectLessonList({
  subjectSlug,
  topics,
}: {
  subjectSlug: string;
  topics: Topic[];
}) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [signedIn, setSignedIn] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    Promise.all([
      fetch("/api/learn/session", { cache: "no-store" }),
      fetch("/api/learn/progress", { cache: "no-store" }),
    ])
      .then(async ([sessionRes, progressRes]) => {
        const session = (await sessionRes.json()) as { user?: unknown };
        const progress = (await progressRes.json()) as { completedIds?: string[] };
        if (!mountedRef.current) return;
        setSignedIn(Boolean(session?.user));
        setCompletedIds(new Set(progress?.completedIds ?? []));
      })
      .catch(() => {
        if (!mountedRef.current) return;
        setSignedIn(false);
        setCompletedIds(new Set());
      });
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {topics.map((topic) => {
        const done = topic.lessons.filter((l) => completedIds.has(l.id)).length;
        const total = topic.lessons.length;
        const pct = total ? Math.round((done / total) * 100) : 0;

        return (
          <div
            key={topic.id}
            className="overflow-hidden rounded-2xl border border-forest-100 bg-white"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forest-100 bg-forest-950 px-6 py-4">
              <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-white">
                {topic.title}
              </h2>
              <div className="flex items-center gap-3">
                {signedIn && total > 0 && (
                  <span className="text-xs font-bold text-emerald-400">
                    {done}/{total}
                  </span>
                )}
                <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-400">
                  {total} {total === 1 ? "lesson" : "lessons"}
                </span>
              </div>
            </div>

            {signedIn && total > 0 && (
              <div className="h-1 bg-forest-100">
                <div
                  className="h-full bg-gold-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}

            <ul className="divide-y divide-forest-50">
              {topic.lessons.map((lesson, i) => {
                const complete = completedIds.has(lesson.id);
                return (
                  <li key={lesson.id}>
                    <Link
                      href={learnUrl(`/${subjectSlug}/${topic.slug}/${lesson.slug}`)}
                      className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gold-50/60 sm:px-6 sm:py-4"
                    >
                      {signedIn && complete ? (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 sm:h-9 sm:w-9">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </span>
                      ) : (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest-50 text-sm font-extrabold text-forest-700 transition-colors group-hover:bg-gold-500 group-hover:text-white sm:h-9 sm:w-9">
                          {i + 1}
                        </span>
                      )}
                      <span
                        className={`flex-1 min-w-0 font-semibold text-sm sm:text-base transition-colors ${
                          signedIn && complete
                            ? "text-forest-400 group-hover:text-gold-600"
                            : "text-forest-900 group-hover:text-gold-700"
                        }`}
                      >
                        {lesson.title}
                      </span>
                      <PlayCircle className="h-4 w-4 text-forest-300 transition-colors group-hover:text-gold-500 sm:h-5 sm:w-5" />
                    </Link>
                  </li>
                );
              })}
              {topic.lessons.length === 0 && (
                <li className="px-6 py-6 text-sm text-ink-soft">
                  <BookOpenCheck className="mr-2 inline h-4 w-4" />
                  Lessons in this topic are being prepared.
                </li>
              )}
              {topic.exam?.published && (
                <li>
                  <Link
                    href={learnUrl(`/${subjectSlug}/${topic.slug}/exam`)}
                    className="group flex items-center gap-3 border-t border-gold-200 bg-gold-50/60 px-4 py-3 transition-colors hover:bg-gold-100/60 sm:px-6 sm:py-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-100 sm:h-9 sm:w-9">
                      <ClipboardList className="h-5 w-5 text-gold-600" />
                    </span>
                    <span className="flex-1 min-w-0 font-semibold text-sm sm:text-base text-gold-800 group-hover:text-gold-900">
                      {topic.exam.title}
                    </span>
                    <span className="rounded-lg bg-gold-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-700">
                      Exam
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
