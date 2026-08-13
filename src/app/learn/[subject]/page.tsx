import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui";
import SubjectLessonList from "@/components/learn/SubjectLessonList";
import { getSubjectWithTopics, getSubjects } from "@/lib/learn";
import { learnUrl } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const subjects = await getSubjects();
  return subjects.map((s) => ({ subject: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string }>;
}): Promise<Metadata> {
  const { subject: slug } = await params;
  const subject = await getSubjectWithTopics(slug);
  if (!subject) return {};
  return {
    title: `${subject.name} — E-Learning`,
    description: subject.description ?? `Lessons and topics for ${subject.name} on the ITDS E-Learning Hub.`,
  };
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject: slug } = await params;
  const subject = await getSubjectWithTopics(slug);
  if (!subject) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: subject.name,
    description: subject.description ?? undefined,
    provider: {
      "@type": "CollegeOrUniversity",
      name: "Department of Information Technology and Decision Sciences, UENR",
    },
    inLanguage: "en",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      name: `${subject.name} on the ITDS E-Learning Hub`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        title={subject.name}
        subtitle={subject.description ?? undefined}
        crumbs={[
  { label: "Home", href: learnUrl("/") },
  { label: "Learn", href: learnUrl("/") },
  { label: subject.name },
]}
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <SubjectLessonList
          subjectSlug={subject.slug}
          topics={subject.topics.map((t) => ({
            id: t.id,
            title: t.title,
            slug: t.slug,
            lessons: t.lessons.map((l) => ({
              id: l.id,
              slug: l.slug,
              title: l.title,
            })),
          }))}
        />

        {subject.topics.length === 0 && (
          <EmptyState
            title="No topics yet"
            description="Topics for this course are being structured by the department."
          />
        )}

        <Link
          href={learnUrl("/")}
          className="mt-10 inline-flex items-center gap-1.5 text-sm font-bold text-gold-600 hover:text-gold-700"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          All courses
        </Link>
      </section>
    </>
  );
}
