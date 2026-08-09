import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Dumbbell,
  GraduationCap,
  MonitorPlay,
  Target,
} from "lucide-react";
import LessonContent from "@/components/learn/LessonContent";
import QuizBlock from "@/components/learn/QuizBlock";
import LessonProgress from "@/components/learn/LessonProgress";
import CodeBlock from "@/components/learn/CodeBlock";
import {
  getAllLessonPaths,
  getPublicLesson,
  readingMinutes,
  resolvePublishedContent,
} from "@/lib/learn";
import { cn, LEARN_URL, learnUrl } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const paths = await getAllLessonPaths();
  return paths.map((p) => ({
    subject: p.topic.subject.slug,
    topic: p.topic.slug,
    lesson: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string; topic: string; lesson: string }>;
}): Promise<Metadata> {
  const { subject, topic, lesson } = await params;
  const row = await getPublicLesson(subject, topic, lesson);
  if (!row) return {};
  const content = resolvePublishedContent(row);
  return {
    title: `${row.title} — ${row.topic.subject.name}`,
    description:
      content.objective ||
      `Lesson in ${row.topic.subject.name} · ${row.topic.title}, from the ITDS E-Learning Hub.`,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ subject: string; topic: string; lesson: string }>;
}) {
  const { subject: subjectSlug, topic: topicSlug, lesson: lessonSlug } = await params;

  const lessonRow = await getPublicLesson(subjectSlug, topicSlug, lessonSlug);
  if (!lessonRow) notFound();

  const content = resolvePublishedContent(lessonRow);
  const { subject, lessons: topicLessons } = lessonRow.topic;
  const minutes = readingMinutes(content);

  const idx = topicLessons.findIndex((l) => l.id === lessonRow.id);
  const prevLesson = idx > 0 ? topicLessons[idx - 1] : null;
  const nextLesson =
    idx >= 0 && idx < topicLessons.length - 1 ? topicLessons[idx + 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lessonRow.title,
    description: content.objective || undefined,
    learningResourceType: "Lesson",
    inLanguage: "en",
    isPartOf: {
      "@type": "Course",
      name: subject.name,
      url: `${LEARN_URL}/${subject.slug}`,
    },
    provider: {
      "@type": "CollegeOrUniversity",
      name: "Department of Information Technology and Decision Sciences, UENR",
    },
    audience: { "@type": "EducationalAudience", educationalRole: "student" },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-24 sm:px-6 lg:px-8 lg:pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-soft">
        <Link href={learnUrl("/")} className="transition-colors hover:text-gold-600">
          Learn
        </Link>
        <span className="text-forest-300">/</span>
        <Link href={learnUrl(`/${subject.slug}`)} className="transition-colors hover:text-gold-600">
          {subject.name}
        </Link>
        <span className="text-forest-300">/</span>
        <span className="text-forest-800">{lessonRow.topic.title}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_300px]">
        {/* Main content */}
        <article className="min-w-0">
          <h1 className="display-heading text-balance text-2xl font-extrabold uppercase tracking-tight text-forest-950 sm:text-3xl lg:text-4xl">
            {lessonRow.title}
          </h1>

          {/* Meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-semibold text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 text-gold-500" />
              {minutes} min read
            </span>
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-gold-500" />
              {topicLessons.length} {topicLessons.length === 1 ? "lesson" : "lessons"} in topic
            </span>
          </div>

          {/* Objective */}
          {content.objective && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-forest-50/70 p-5">
              <Target className="mt-0.5 h-5 w-5 shrink-0 text-forest-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-forest-700">
                  Learning objective
                </p>
                <p className="mt-1 break-words leading-relaxed text-forest-900">{content.objective}</p>
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
              <CodeBlock code={content.starterCode} language={content.playgroundLang ?? undefined} />
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
              <QuizBlock questions={content.quiz} lessonId={lessonRow.id} />
            </div>
          )}

          {/* Prev / next — side-by-side halves on mobile, compact on desktop */}
          <div className="mt-12 grid grid-cols-2 gap-3 border-t border-forest-100 pt-8 sm:flex sm:items-start sm:gap-4">
            {prevLesson && (
              <Link
                href={learnUrl(`/${subject.slug}/${topicSlug}/${prevLesson.slug}`)}
                className={cn(
                  "group min-w-0 rounded-xl border border-forest-100 bg-white p-4 transition-all hover:border-gold-300 hover:shadow-md",
                  !nextLesson && "col-span-2"
                )}
              >
                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-ink-soft">
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                  Previous
                </span>
                <span className="mt-1 block line-clamp-2 text-sm font-bold text-forest-900 group-hover:text-gold-700">
                  {prevLesson.title}
                </span>
              </Link>
            )}
            {nextLesson && (
              <Link
                href={learnUrl(`/${subject.slug}/${topicSlug}/${nextLesson.slug}`)}
                className={cn(
                  "group min-w-0 rounded-xl border border-forest-100 bg-white p-4 text-right transition-all hover:border-gold-300 hover:shadow-md",
                  !prevLesson ? "col-span-2 justify-self-end" : "sm:ml-auto"
                )}
              >
                <span className="flex items-center justify-end gap-1 text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Next
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="mt-1 block line-clamp-2 text-sm font-bold text-forest-900 group-hover:text-gold-700">
                  {nextLesson.title}
                </span>
              </Link>
            )}
          </div>
        </article>

        {/* Sidebar — client, so the page stays statically rendered */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <LessonProgress
            lessonId={lessonRow.id}
            activeLessonId={lessonRow.id}
            topicLessons={topicLessons.map((l) => ({
              id: l.id,
              slug: l.slug,
              title: l.title,
            }))}
            subjectSlug={subjectSlug}
            topicSlug={topicSlug}
          />
        </aside>
      </div>
    </div>
  );
}
