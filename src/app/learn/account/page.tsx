import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  GraduationCap,
  Trophy,
} from "lucide-react";
import { getMyProgress, getSubjects } from "@/lib/learn";
import { requireAuth } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export default async function LearnAccountPage() {
  const [session, subjects] = await Promise.all([
    requireAuth("/learn/account/signin"),
    getSubjects(),
  ]);
  const myProgress = await getMyProgress(session.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-lg bg-forest-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-forest-600">
            <GraduationCap className="h-4 w-4" />
            My Progress
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-forest-950">
            Your progress
          </h1>
        </div>
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 rounded-lg bg-forest-950 px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lg"
        >
          Continue learning <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-forest-100 bg-white p-5">
          <Trophy className="h-5 w-5 text-forest-500" />
          <p className="mt-3 font-display text-3xl font-extrabold text-forest-950">
            {myProgress.length}
          </p>
          <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
            Lessons completed
          </p>
        </div>
        <div className="rounded-2xl border border-forest-100 bg-white p-5">
          <Compass className="h-5 w-5 text-forest-500" />
          <p className="mt-3 font-display text-3xl font-extrabold text-forest-950">
            {subjects.length}
          </p>
          <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
            Subjects available
          </p>
        </div>
        <div className="rounded-2xl border border-forest-100 bg-white p-5">
          <GraduationCap className="h-5 w-5 text-forest-500" />
          <p className="mt-3 font-display text-3xl font-extrabold text-forest-950">
            {new Set(myProgress.map((p) => p.lesson.topic.subject.slug)).size}
          </p>
          <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
            Subjects explored
          </p>
        </div>
      </div>

      {/* Completed lessons */}
      <h2 className="mt-10 font-display text-lg font-extrabold text-forest-950">
        Completed lessons
      </h2>
      {myProgress.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-forest-200 bg-white px-6 py-14 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-forest-200" />
          <p className="mt-3 font-display text-lg font-bold text-forest-900">
            Nothing completed yet
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Head to the E-Learning Hub and mark your first lesson complete.
          </p>
          <Link
            href="/learn"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-forest-950 px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800"
          >
            Browse subjects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {myProgress.map((item) => (
            <li key={item.id}>
              <Link
                href={`/learn/${item.lesson.topic.subject.slug}/${item.lesson.topic.slug}/${item.lesson.slug}`}
                className="flex items-center gap-4 rounded-xl border border-forest-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-forest-300 hover:shadow-md"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-forest-900">
                    {item.lesson.title}
                  </span>
                  <span className="block text-xs text-ink-soft">
                    {item.lesson.topic.subject.name} · {item.lesson.topic.title}
                  </span>
                </span>
                <span className="hidden shrink-0 text-xs text-ink-soft sm:block">
                  Completed {formatDate(item.completedAt ?? item.lesson.createdAt)}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-forest-300" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
