import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/ui";
import AlumniSurveyForm from "@/components/AlumniSurveyForm";
import { SPMS_PROGRAMS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Alumni Survey",
  description:
    "Share your experience as an ITDS graduate. Your feedback helps the department enhance its academic programmes.",
  alternates: { canonical: "/alumni-survey" },
  openGraph: {
    type: "website",
    url: "/alumni-survey",
    title: "ITDS Alumni Survey — UENR",
    description:
      "Share your experience as an ITDS graduate to help enhance the quality of our academic programmes.",
  },
};

export default function AlumniSurveyPage() {
  return (
    <>
      <PageHeader
        title="ITDS Alumni Survey"
        subtitle="As part of our continuous academic quality enhancement, we invite all graduates to share how their training has served them in the workplace."
        crumbs={[{ label: "Home", href: "/" }, { label: "Alumni Survey" }]}
      />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-start gap-4 rounded-2xl border border-gold-200 bg-gold-50 p-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-100">
            <ClipboardList className="h-6 w-6 text-gold-600" />
          </span>
          <div>
            <h2 className="font-display text-lg font-extrabold text-forest-950">
              Help shape the future of ITDS
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              This survey takes less than ten minutes to complete. Your responses inform
              curriculum reviews and improvements to teaching and learning, and are kept
              confidential.
            </p>
          </div>
        </div>

        <AlumniSurveyForm programmes={SPMS_PROGRAMS.map((p) => p.title)} />
      </section>
    </>
  );
}
