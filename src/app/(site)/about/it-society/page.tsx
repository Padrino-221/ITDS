import { CheckCircle } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/ui";
import { ExecutivesSection } from "@/components/ExecutivesSection";
import { getAcademicYears, getStudentExecutives } from "@/lib/data";
import { getJSONSetting, getStringSetting } from "@/lib/settings";

export const metadata = {
  title: "Information Technology Society",
  description:
    "The Information Technology Society — the official student association of the ITDS Department at UENR and home of the UENR Tech Fair.",
  alternates: { canonical: "/about/it-society" },
  openGraph: {
    type: "website",
    url: "/about/it-society",
    title: "IT Society — ITDS UENR",
    description: "The official student association of the ITDS Department at UENR.",
  },
};

// Re-generate when the IT Society settings change (on-demand ISR); 1h fallback.
export const revalidate = 3600;

export default async function ItSocietyPage() {
  const [story, objectives, executives, academicYears] = await Promise.all([
    getStringSetting("its_story", ""),
    getJSONSetting<string[]>("its_objectives", []),
    getStudentExecutives(),
    getAcademicYears(),
  ]);

  return (
    <>
      <PageHeader
        title="Information Technology Society"
        subtitle="The official student association of the ITDS Department — home of the UENR Tech Fair."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "IT Society" },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="The Student Association"
              title="ITS — Empowering Student Innovators"
            />
            <p className="mt-5 leading-relaxed text-ink-soft">{story}</p>
          </div>

          <div>
            <h3 className="font-display text-xl font-bold text-forest-900">
              Society Objectives
            </h3>
            <ul className="mt-6 space-y-5">
              {objectives.map((objective) => (
                <li key={objective} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-50">
                    <CheckCircle className="h-4 w-4 text-gold-600" />
                  </span>
                  <p className="text-sm leading-relaxed text-ink-soft">{objective}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ExecutivesSection executives={executives} academicYears={academicYears} />
    </>
  );
}
