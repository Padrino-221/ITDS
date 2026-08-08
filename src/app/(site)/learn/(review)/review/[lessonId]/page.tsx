import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Dumbbell,
  List,
  MonitorPlay,
  Target,
  XCircle,
} from "lucide-react";
import LessonContent from "@/components/learn/LessonContent";
import { getLessonForAuthor, resolvePublishedContent } from "@/lib/learn";
import { approveLesson, requestChanges } from "@/app/(site)/learn/actions";
import { requireRole } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

export default async function ReviewLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  await requireRole(["ADMIN"], "/learn/account/signin");

  const lesson = await getLessonForAuthor(lessonId);
  if (!lesson) notFound();

  const content = resolvePublishedContent(lesson);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link
        href="/learn/review"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-soft transition-colors hover:text-forest-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to review queue
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-lg bg-gold-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-600">
            <ClipboardCheck className="h-4 w-4" />
            In review
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-forest-950">
            {lesson.title}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {lesson.topic.subject.name} · {lesson.topic.title} · by {lesson.author.name} ·{" "}
            submitted {formatDateTime(lesson.updatedAt)}
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-8 rounded-2xl border border-forest-100 bg-white p-6 sm:p-8">
        <h2 className="font-display text-lg font-extrabold text-forest-950">
          Preview
        </h2>

        {content.objective && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border-l-4 border-gold-500 bg-gold-50/70 p-4">
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
            <p className="text-sm leading-relaxed text-forest-900">{content.objective}</p>
          </div>
        )}

        <div className="mt-6">
          <LessonContent blocks={content.contentBody} />
        </div>

        {content.hasPlayground && content.starterCode && (
          <div className="mt-8">
            <h3 className="flex items-center gap-2 font-display text-base font-extrabold text-forest-950">
              <MonitorPlay className="h-4 w-4 text-gold-500" />
              Playground ({content.playgroundLang ?? "code"})
            </h3>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-forest-950 p-4 text-[13px] text-emerald-100">
              <code>{content.starterCode}</code>
            </pre>
          </div>
        )}

        {content.exercisePrompt && (
          <div className="mt-8 rounded-xl bg-forest-50/60 p-4">
            <h3 className="flex items-center gap-2 font-display text-base font-extrabold text-forest-950">
              <Dumbbell className="h-4 w-4 text-gold-500" />
              Practice exercise
            </h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">
              {content.exercisePrompt}
            </p>
          </div>
        )}

        {content.quiz && content.quiz.length > 0 && (
          <div className="mt-8">
            <h3 className="flex items-center gap-2 font-display text-base font-extrabold text-forest-950">
              <List className="h-4 w-4 text-gold-500" />
              Quiz ({content.quiz.length} question{content.quiz.length === 1 ? "" : "s"})
            </h3>
            <div className="mt-3 space-y-4">
              {content.quiz.map((q, qi) => (
                <div key={qi} className="rounded-xl border border-forest-100 p-4">
                  <p className="text-sm font-bold text-forest-900">
                    {qi + 1}. {q.question}
                  </p>
                  <ul className="mt-2 space-y-1 pl-5 text-sm text-ink">
                    {q.options.map((option, oi) => (
                      <li key={oi} className={oi === q.answer ? "font-semibold text-emerald-700" : ""}>
                        {String.fromCharCode(65 + oi)}. {option}
                        {oi === q.answer && " ✓"}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Decision */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <form
          action={approveLesson.bind(null, lesson.id)}
          className="rounded-2xl border border-emerald-200 bg-white p-6"
        >
          <h3 className="flex items-center gap-2 font-display text-base font-extrabold text-emerald-800">
            <CheckCircle2 className="h-5 w-5" />
            Approve &amp; publish
          </h3>
          <p className="mt-2 text-sm text-ink-soft">
            The lesson becomes publicly visible in the Learning Hub immediately.
          </p>
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
          >
            Approve lesson
          </button>
        </form>

        <form
          action={requestChanges.bind(null, lesson.id)}
          className="rounded-2xl border border-red-200 bg-white p-6"
        >
          <h3 className="flex items-center gap-2 font-display text-base font-extrabold text-red-700">
            <XCircle className="h-5 w-5" />
            Request changes
          </h3>
          <textarea
            name="reviewNote"
            required
            rows={3}
            placeholder="What should the author fix before publishing?"
            className="mt-3 w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-forest-950 placeholder:text-ink-soft/60 outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
          />
          <button
            type="submit"
            className="mt-3 w-full rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition-all hover:-translate-y-0.5 hover:bg-red-50"
          >
            Send back to author
          </button>
        </form>
      </div>
    </div>
  );
}
