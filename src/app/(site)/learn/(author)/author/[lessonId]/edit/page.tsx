import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import LessonEditor from "@/components/learn/LessonEditor";
import { getLessonForAuthor } from "@/lib/learn";
import { requireRole } from "@/lib/auth";
import type { ContentBlock, QuizQuestion } from "@/lib/learn";

export default async function EditLessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { lessonId } = await params;
  const { saved } = await searchParams;

  const user = await requireRole(["LECTURER", "EDITOR", "ADMIN"], "/learn/account/signin");
  const lesson = await getLessonForAuthor(lessonId);
  if (!lesson) notFound();
  if (lesson.authorId !== user.id && user.role !== "ADMIN") {
    redirect("/learn/author");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link
        href="/learn/author"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-soft transition-colors hover:text-forest-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my lessons
      </Link>

      <h1 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-tight text-forest-950">
        Edit lesson
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Every lesson follows the same template — fill each section, then submit for review.
      </p>

      {saved === "1" && (
        <p className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Draft saved.
        </p>
      )}

      <div className="mt-8">
        <LessonEditor
          lesson={{
            id: lesson.id,
            title: lesson.title,
            objective: lesson.objective,
            contentBody: (lesson.contentBody ?? []) as ContentBlock[],
            hasPlayground: lesson.hasPlayground,
            playgroundLang: lesson.playgroundLang,
            starterCode: lesson.starterCode,
            exercisePrompt: lesson.exercisePrompt,
            quiz: (lesson.quiz ?? null) as QuizQuestion[] | null,
            status: lesson.status,
            reviewNote: lesson.reviewNote,
            subjectName: lesson.topic.subject.name,
            topicTitle: lesson.topic.title,
          }}
        />
      </div>
    </div>
  );
}
