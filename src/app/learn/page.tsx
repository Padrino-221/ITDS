import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import LearnCatalog from "@/components/learn/LearnCatalog";
import { getAllPublishedLessons, getSubjects } from "@/lib/learn";
import { getStringSetting } from "@/lib/settings";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ITDS E-Learning Hub",
  description:
    "Free, structured lessons by the Department of IT and Decision Sciences, UENR — Web Development, Python, Networking, Databases, Data Structures and Operating Systems.",
};

export default async function LearnHomePage() {
  const [subjects, announcement, lessons] = await Promise.all([
    getSubjects(),
    getStringSetting(
      "learn_intro",
      "Free, structured lessons authored by our lecturers — learn at your own pace."
    ),
    getAllPublishedLessons(),
  ]);

  return (
    <>
      <PageHeader
        title="ITDS E-Learning Hub"
        subtitle={announcement}
        crumbs={[{ label: "Home", href: "/" }, { label: "Learn" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <LearnCatalog
          subjects={subjects.map((s) => ({
            name: s.name,
            slug: s.slug,
            description: s.description ?? null,
            topicCount: s._count.topics,
          }))}
          lessons={lessons}
        />
      </section>
    </>
  );
}
