"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  FolderTree,
  GraduationCap,
  Search,
  X,
} from "lucide-react";
import type { LessonSearchResult } from "@/lib/learn";

export type CatalogSubject = {
  name: string;
  slug: string;
  description: string | null;
  topicCount: number;
};

/** Highlight every term occurrence in `text` with a gold mark. */
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;

  const lower = text.toLowerCase();
  const spans: Array<{ start: number; end: number }> = [];
  for (const term of terms) {
    let idx = lower.indexOf(term);
    while (idx !== -1) {
      spans.push({ start: idx, end: idx + term.length });
      idx = lower.indexOf(term, idx + 1);
    }
  }
  spans.sort((a, b) => a.start - b.start || b.end - a.end);

  const merged: Array<{ start: number; end: number }> = [];
  for (const span of spans) {
    const last = merged[merged.length - 1];
    if (last && span.start <= last.end) last.end = Math.max(last.end, span.end);
    else merged.push({ ...span });
  }

  const out: React.ReactNode[] = [];
  let cursor = 0;
  for (const span of merged) {
    out.push(text.slice(cursor, span.start));
    out.push(
      <mark
        key={span.start}
        className="rounded bg-gold-100 px-0.5 text-gold-800"
      >
        {text.slice(span.start, span.end)}
      </mark>
    );
    cursor = span.end;
  }
  out.push(text.slice(cursor));
  return <>{out}</>;
}

export default function LearnCatalog({
  subjects,
  lessons,
}: {
  subjects: CatalogSubject[];
  lessons: LessonSearchResult[];
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const terms = useMemo(
    () => query.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [query]
  );
  const searching = terms.length > 0;

  const results = useMemo(() => {
    if (!terms.length) return [];
    return lessons.filter((l) => {
      const hay =
        `${l.title} ${l.objective} ${l.contentText} ${l.topicTitle} ${l.subjectName}`
          .toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [lessons, terms]);

  const clear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div>
      {/* Search */}
      <div className="mx-auto max-w-2xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setQuery("");
                inputRef.current?.blur();
              }
            }}
            placeholder="Search lessons, topics or subjects… e.g. Python, SQL, bubble sort"
            aria-label="Search lessons across all subjects"
            className="w-full rounded-2xl border border-forest-200 bg-white py-3.5 pl-12 pr-11 text-sm text-forest-950 shadow-sm outline-none transition-all placeholder:text-ink-soft/60 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink-soft transition-colors hover:bg-forest-50 hover:text-forest-900"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-ink-soft">
          {searching ? (
            <>
              {results.length} {results.length === 1 ? "lesson" : "lessons"}{" "}
              found across {subjects.length} subjects
            </>
          ) : (
            <>
              Search across {subjects.length} subjects and {lessons.length}{" "}
              lessons
            </>
          )}
        </p>
      </div>

      {searching ? (
        /* Results */
        <div className="mt-10">
          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-forest-200 bg-white px-6 py-16 text-center">
              <BookOpenCheck className="mx-auto h-8 w-8 text-forest-200" />
              <p className="mt-3 font-display text-lg font-bold text-forest-900">
                No lessons match “{query.trim()}”
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                Try a different keyword — a topic name, subject or concept.
              </p>
              <button
                type="button"
                onClick={clear}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-forest-950 px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800"
              >
                Clear search
              </button>
            </div>
          ) : (
            <ul className="mx-auto max-w-3xl space-y-3">
              {results.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/learn/${l.subjectSlug}/${l.topicSlug}/${l.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border border-forest-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-md sm:p-5"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-700 transition-colors group-hover:bg-gold-500 group-hover:text-white">
                      <BookOpenCheck className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-forest-900 group-hover:text-gold-700">
                        <Highlight text={l.title} terms={terms} />
                      </span>
                      <span className="mt-0.5 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                        {l.subjectName} · {l.topicTitle}
                      </span>
                      {l.objective && (
                        <span className="mt-1 block text-sm leading-relaxed text-ink-soft line-clamp-2">
                          <Highlight text={l.objective} terms={terms} />
                        </span>
                      )}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-forest-300 transition-transform group-hover:translate-x-1 group-hover:text-gold-500" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        /* Subject grid */
        <>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject, i) => (
              <Link
                key={subject.slug}
                href={`/learn/${subject.slug}`}
                className="group flex flex-col rounded-2xl border border-forest-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold-300 hover:shadow-xl hover:shadow-forest-950/5"
              >
                <span
                  className={
                    i % 2 === 0
                      ? "flex h-12 w-12 items-center justify-center rounded-xl bg-gold-50 text-gold-600"
                      : "flex h-12 w-12 items-center justify-center rounded-xl bg-forest-50 text-forest-700"
                  }
                >
                  <FolderTree className="h-6 w-6" />
                </span>
                <h2 className="mt-4 font-display text-xl font-extrabold text-forest-950 group-hover:text-gold-700">
                  {subject.name}
                </h2>
                {subject.description && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                    {subject.description}
                  </p>
                )}
                <span className="mt-5 flex items-center justify-between border-t border-forest-100 pt-4 text-sm font-bold text-forest-800">
                  <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-ink-soft">
                    <GraduationCap className="h-4 w-4" />
                    {subject.topicCount}{" "}
                    {subject.topicCount === 1 ? "topic" : "topics"}
                  </span>
                  <span className="flex items-center gap-1 text-gold-600 transition-transform group-hover:translate-x-1">
                    Start learning <ArrowRight className="h-4 w-4" />
                  </span>
                </span>
              </Link>
            ))}
          </div>

          {subjects.length === 0 && (
            <p className="rounded-2xl border border-dashed border-forest-200 bg-white px-6 py-16 text-center text-ink-soft">
              Lessons are being prepared — check back soon.
            </p>
          )}
        </>
      )}
    </div>
  );
}
