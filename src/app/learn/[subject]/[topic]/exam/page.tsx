import { notFound } from "next/navigation";
import { getPublishedExam } from "@/lib/learn";
import { prisma } from "@/lib/prisma";
import ExamTaker from "@/components/learn/ExamTaker";

export const metadata = { title: "Exam" };

export default async function ExamPage({
  params,
}: {
  params: Promise<{ subject: string; topic: string }>;
}) {
  const { subject: subjectSlug, topic: topicSlug } = await params;

  // Verify the topic exists
  const topic = await prisma.topic.findFirst({
    where: { slug: topicSlug, subject: { slug: subjectSlug } },
    include: { subject: true },
  });
  if (!topic) notFound();

  // Get published exam
  const exam = await getPublishedExam(topic.id);
  if (!exam) notFound();

  return <ExamTaker exam={exam as any} subjectSlug={subjectSlug} />;
}
