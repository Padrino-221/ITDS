import Link from "next/link";
import { CheckCircle, Sparkles, Users } from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/ui";
import { getJSONSetting, getStringSetting } from "@/lib/settings";

export default async function ItSocietyPage() {
  const [story, objectives] = await Promise.all([
    getStringSetting("its_story", ""),
    getJSONSetting<string[]>("its_objectives", []),
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
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="The Student Association"
              title="ITS — Empowering Student Innovators"
            />
            <p className="mt-5 leading-relaxed text-ink-soft">{story}</p>
            <div className="mt-8 rounded-xl border border-gold-200 bg-gold-50 p-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-gold-600" />
                <h3 className="font-display text-lg font-bold text-forest-900">
                  Annual Flagship Event
                </h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                The <strong>UENR Tech Fair</strong> brings together hundreds of student
                innovators, industry partners and the wider community every year to
                showcase technology made in the ITDS Department.
              </p>
              <Link
                href="/news"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold-700 transition-colors hover:text-gold-800"
              >
                Catch up on Tech Fair news →
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-forest-100 bg-white p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-800 text-gold-300">
                <Users className="h-6 w-6" />
              </span>
              <h3 className="font-display text-xl font-bold text-forest-900">
                Society Objectives
              </h3>
            </div>
            <ul className="mt-6 space-y-4">
              {objectives.map((objective) => (
                <li key={objective} className="flex gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
                  <p className="text-sm leading-relaxed text-ink-soft">{objective}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
