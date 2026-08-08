import Image from "next/image";
import { PageHeader, SectionHeading } from "@/components/ui";
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
        <div className="space-y-20">
          {areas.map((area, i) => (
            <div
              key={area.id}
              id={area.slug}
              className="grid scroll-mt-28 items-center gap-10 lg:grid-cols-2"
            >
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <div className="relative overflow-hidden rounded-xl">
                  <Image
                    src={area.image ?? "/images/research/ai.jpg"}
                    alt={area.title}
                    width={720}
                    height={460}
                    className="h-[340px] w-full object-cover"
                  />
                </div>
              </div>
              <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                <SectionHeading
                  eyebrow={`Research Area ${String(i + 1).padStart(2, "0")}`}
                  title={area.title}
                />
                <p className="mt-4 leading-relaxed text-ink-soft">{area.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
