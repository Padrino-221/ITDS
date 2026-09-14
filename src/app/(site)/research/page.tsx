import { PageHeader } from "@/components/ui";
import { ResearchAreaCard } from "@/components/cards";
import { getResearchAreas } from "@/lib/data";

export const metadata = {
  title: "Research Areas",
  description:
    "Explore the research areas of the ITDS Department, UENR — Artificial Intelligence, Web Development, Cybersecurity, Data Science, Networking and more.",
  alternates: { canonical: "/research" },
  openGraph: {
    type: "website",
    url: "/research",
    title: "Research Areas — ITDS UENR",
    description: "Research areas of the Department of Information Technology and Decision Sciences, UENR.",
  },
};

export default async function ResearchPage() {
  const areas = await getResearchAreas();

  return (
    <>
      <PageHeader
        title="Areas For Research Work"
        subtitle="Explore the research domains that shape student projects and postgraduate study in the department."
        crumbs={[{ label: "Home", href: "/" }, { label: "Research Areas" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {areas.map((area) => (
            <ResearchAreaCard key={area.id} area={area} />
          ))}
        </div>
      </section>
    </>
  );
}
