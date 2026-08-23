import { notFound } from "next/navigation";
import Link from "next/link";
import { ClipboardList, ArrowLeft } from "lucide-react";
import { getExamByTopic } from "@/lib/learn";
import { requireRole } from "@/lib/auth";
import { absoluteUrl, learnUrl } from "@/lib/utils";
import ExamEditor from "@/components/learn/ExamEditor";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Edit Exam" };

export default async function ExamEditorPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  await requireRole(["ADMIN", "LECTURER"], absoluteUrl("/staff-panel/login"));
  const { topicId } = await params;

  // Fetch topic to verify it exists
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { subject: true },
  });
  if (!topic) notFound();

  // Get or create exam data
  const existing = await getExamByTopic(topicId);

  const examData = existing
    ? {
        id: existing.id,
        topicId: existing.topicId,
        title: existing.title,
        description: existing.description,
        timeLimit: existing.timeLimit,
        passScore: existing.passScore,
        published: existing.published,
        questions: existing.questions,
      }
    : {
        id: null,
        topicId,
        title: `${topic.title} Exam`,
        description: null,
        timeLimit: null,
        passScore: 70,
        published: false,
        questions: [],
      };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href={learnUrl("/manage")}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-forest-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to curriculum
      </Link>

      <div className="mt-6">
        <span className="inline-flex items-center gap-2 rounded-lg bg-gold-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-600">
          <ClipboardList className="h-4 w-4" />
          Exam Editor
        </span>
        <h1 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-forest-950">
          {existing ? "Edit Exam" : "Create Exam"}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {existing
            ? "Update the exam settings and questions below."
            : "Create a new exam for this topic. Learners will take this after completing the lessons."}
        </p>
      </div>

      <div className="mt-8">
        <ExamEditor
          exam={examData}
          topicId={topicId}
          topicTitle={topic.title}
          subjectName={topic.subject.name}
        />
      </div>
    </div>
  );
}
