import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LessonEditor from "@/components/learn/LessonEditor";
import { QueryToast } from "@/components/admin/QueryToast";
import { getLessonForAuthor } from "@/lib/learn";
import { requireRole } from "@/lib/auth";
import { absoluteUrl, learnUrl } from "@/lib/utils";
import type { ContentBlock, QuizQuestion } from "@/lib/learn";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;

  const user = await requireRole(
    ["LECTURER", "ADMIN"],
    absoluteUrl("/staff-panel/login")
  );
  const lesson = await getLessonForAuthor(lessonId);
  if (!lesson) notFound();
  if (lesson.authorId !== user.id && user.role !== "ADMIN") {
    redirect(learnUrl("/author"));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link
        href={learnUrl("/author")}
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

      <QueryToast param="saved" message="Draft saved." />

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