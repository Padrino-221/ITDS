import Image from "next/image";
import Link from "next/link";
import {
  Database,
  Eye,
  GraduationCap,
  Award,
  Route,
  Target,
  Users,
} from "lucide-react";
import { PageHeader, SectionHeading } from "@/components/ui";
import {
  getJSONSetting,
  getStringSetting,
} from "@/lib/settings";
import type { AcronymValue, CoreValue, Highlight } from "@/lib/settings";

const valueIcons = [Award, Route, Users, GraduationCap];

export const metadata = {
  title: "About Us",
  description:
    "Learn about the Department of Information Technology and Decision Sciences at UENR — our story, vision, mission, core values and the Student Project Management System (SPMS).",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    url: "/about",
    title: "About Us — ITDS UENR",
    description: "The story, vision, mission and values of the ITDS Department at UENR.",
  },
};

export default async function AboutPage() {
  const [story, vision, mission, coreValues, acronymValues, highlights] =
    await Promise.all([
      getStringSetting("about_story", ""),
      getStringSetting("about_vision", ""),
      getStringSetting("about_mission", ""),
      getJSONSetting<CoreValue[]>("core_values", []),
      getJSONSetting<AcronymValue[]>("acronym_values", []),
      getJSONSetting<Highlight[]>("spms_highlights", []),
    ]);

  return (
    <>
      <PageHeader
        title="About Us"
        subtitle="The Department of Information Technology & Decision Sciences at the University of Energy and Natural Resources."
        crumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]}
      />

      {/* Story */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Who We Are" title="A Department Built for the Digital Age" />
            <p className="mt-5 leading-relaxed text-ink-soft">{story}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-forest-100 bg-white p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                  <Eye className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-forest-900">Our Vision</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{vision}</p>
              </div>
              <div className="rounded-xl border border-forest-100 bg-white p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                  <Target className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-forest-900">Our Mission</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{mission}</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -right-4 -top-4 h-28 w-28 rounded-tr-3xl border-r-4 border-t-4 border-gold-400" />
            <div className="relative overflow-hidden rounded-xl">
              <Image
                src="/images/about/campus.jpg"
                alt="UENR campus"
                width={720}
                height={540}
                className="h-[420px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core values */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What Guides Us"
            title="ITDS Core Values"
            align="center"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {coreValues.map((value, i) => {
              const Icon = valueIcons[i % valueIcons.length];
              return (
                <div
                  key={value.title}
                  className="group rounded-xl border border-forest-100 bg-paper p-6 text-center transition-all duration-300 hover:-translate-y-1"
                >
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-forest-800 text-gold-300 transition-colors group-hover:bg-gold-500 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-forest-900">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SPMS highlights */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-xl">
              <Image
                src="/images/about/students.jpg"
                alt="Students working"
                width={720}
                height={540}
                className="h-[420px] w-full object-cover"
              />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="The SPMS"
              title="The Student Project Management System"
              description="A comprehensive digital repository that archives and showcases every student project work — from undergraduate to PhD."
            />
            <ul className="mt-8 space-y-5">
              {highlights.map((h, i) => (
                <li key={h.title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 font-display text-base font-bold text-gold-700">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-forest-900">{h.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{h.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ITDS acronym */}
      {acronymValues.length > 0 && (
        <section className="bg-forest-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="The Acronym"
              title="What “ITDS” Stands For"
              className="[&_h2]:text-white"
            />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {acronymValues.map((item) => (
                <div
                  key={item.letter}
                  className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-colors hover:border-gold-500/40"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-500 font-display text-xl font-bold text-white">
                    {item.letter}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">{item.word}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-forest-200/85">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="btn-pill btn-pill-accent px-7 py-3.5 hover:-translate-y-0.5"
              >
                <Database className="h-4 w-4" />
                Explore the Project Repository
              </Link>
              <Link
                href="/about/it-society"
                className="btn-pill border border-white/25 bg-white/5 px-7 py-3.5 text-white hover:-translate-y-0.5 hover:bg-white/10"
              >
                <Users className="h-4 w-4" />
                Meet the IT Society
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
