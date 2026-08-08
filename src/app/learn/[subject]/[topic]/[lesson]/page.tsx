import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Dumbbell,
  ListChecks,
  MonitorPlay,
  SignpostBig,
  Target,
} from "lucide-react";
import LessonContent from "@/components/learn/LessonContent";
import QuizBlock from "@/components/learn/QuizBlock";
import {
  getCompletedLessonIds,
  getPublicLesson,
  resolvePublishedContent,
} from "@/lib/learn";
import { getSession } from "@/lib/auth";
import { toggleLessonComplete } from "@/app/learn/actions";
import { cn } from "@/lib/utils";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ subject: string; topic: string; lesson: string }>;
}) {
  const { subject: subjectSlug, topic: topicSlug, lesson: lessonSlug } = await params;

  const [lessonRow, session] = await Promise.all([
    getPublicLesson(subjectSlug, topicSlug, lessonSlug),
    getSession(),
  ]);
  if (!lessonRow) notFound();

  const content = resolvePublishedContent(lessonRow);
  const { subject, lessons: topicLessons } = lessonRow.topic;

  const completedIds = session ? await getCompletedLessonIds(session.id) : new Set<string>();
  const isCompleted = completedIds.has(lessonRow.id);

  const idx = topicLessons.findIndex((l) => l.id === lessonRow.id);
  const prevLesson = idx > 0 ? topicLessons[idx - 1] : null;
  const nextLesson =
    idx >= 0 && idx < topicLessons.length - 1 ? topicLessons[idx + 1] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-soft">
        <Link href="/learn" className="transition-colors hover:text-forest-600">
          Learn
        </Link>
        <span className="text-forest-300">/</span>
        <Link href={`/learn/${subject.slug}`} className="transition-colors hover:text-forest-600">
          {subject.name}
        </Link>
        <span className="text-forest-300">/</span>
        <span className="text-forest-800">{lessonRow.topic.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_300px]">
        {/* Main content */}
        <article>
          <h1 className="display-heading text-3xl font-extrabold uppercase tracking-tight text-forest-950 sm:text-4xl">
            {lessonRow.title}
          </h1>

          {/* Objective */}
          {content.objective && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-forest-50/70 p-5">
              <Target className="mt-0.5 h-5 w-5 shrink-0 text-forest-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-forest-700">
                  Learning objective
                </p>
                <p className="mt-1 leading-relaxed text-forest-900">{content.objective}</p>
              </div>
            </div>
          )}

          {/* Content body */}
          <div className="mt-8">
            <LessonContent blocks={content.contentBody} />
          </div>

          {/* Worked example / starter code */}
          {content.hasPlayground && content.starterCode && (
            <div className="mt-10">
              <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-forest-950">
                <MonitorPlay className="h-5 w-5 text-forest-600" />
                Code playground
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                An interactive playground for {content.playgroundLang ?? "this language"} is
                coming soon. For now, study the starter code:
              </p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-forest-950 p-4 text-[13px] leading-relaxed text-emerald-100">
                <code>{content.starterCode}</code>
              </pre>
            </div>
          )}

          {/* Practice exercise */}
          {content.exercisePrompt && (
            <div className="mt-10 rounded-2xl border border-forest-100 bg-white p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-forest-950">
                <Dumbbell className="h-5 w-5 text-forest-600" />
                Practice exercise
              </h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink">
                {content.exercisePrompt}
              </p>
            </div>
          )}

          {/* Quiz */}
          {content.quiz && content.quiz.length > 0 && (
            <div className="mt-10">
              <QuizBlock questions={content.quiz} />
            </div>
          )}

          {/* Prev / next */}
          <div className="mt-12 grid gap-4 border-t border-forest-100 pt-8 sm:grid-cols-2">
            {prevLesson ? (
              <Link
                href={`/learn/${subject.slug}/${topicSlug}/${prevLesson.slug}`}
                className="group rounded-xl border border-forest-100 bg-white p-4 transition-all hover:border-forest-300 hover:shadow-md"
              >
                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-ink-soft">
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                  Previous
                </span>
                <span className="mt-1 block text-sm font-bold text-forest-900 group-hover:text-forest-700">
                  {prevLesson.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {nextLesson ? (
              <Link
                href={`/learn/${subject.slug}/${topicSlug}/${nextLesson.slug}`}
                className="group rounded-xl border border-forest-100 bg-white p-4 text-right transition-all hover:border-forest-300 hover:shadow-md"
              >
                <span className="flex items-center justify-end gap-1 text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Next
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="mt-1 block text-sm font-bold text-forest-900 group-hover:text-forest-700">
                  {nextLesson.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {/* Progress */}
          <div className="rounded-2xl border border-forest-100 bg-white p-5">
            <h3 className="flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-wider text-forest-950">
              <ListChecks className="h-4 w-4 text-forest-500" />
              Progress
            </h3>
            {session ? (
              <form action={toggleLessonComplete.bind(null, lessonRow.id)} className="mt-3">
                <button
                  type="submit"
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg",
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
              </form>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                <Link
                  href="/learn/account/signin"
                  className="font-bold text-forest-600 hover:text-forest-700"
                >
                  Sign in
                </Link>{" "}
                to track your progress across lessons.
              </p>
            )}
          </div>

          {/* Topic lessons */}
          <div className="mt-5 rounded-2xl border border-forest-100 bg-white p-5">
            <h3 className="flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-wider text-forest-950">
              <SignpostBig className="h-4 w-4 text-forest-500" />
              {lessonRow.topic.title}
            </h3>
            <ol className="mt-4 space-y-1">
              {topicLessons.map((l) => {
                const active = l.id === lessonRow.id;
                return (
                  <li key={l.id}>
                    <Link
                      href={`/learn/${subject.slug}/${topicSlug}/${l.slug}`}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-forest-950 text-white"
                          : "text-ink-soft hover:bg-forest-50 hover:text-forest-900"
                      )}
                    >
                      {l.title}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
