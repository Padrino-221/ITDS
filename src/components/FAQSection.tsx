"use client";

import { useState } from "react";
import { ChevronDown, MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

type FAQItem = {
  question: string;
  answer: string;
};

const defaultFAQs: FAQItem[] = [
  {
    question: "What programs does the ITDS department offer?",
    answer:
      "We offer undergraduate (BSc), diploma, MSc, MPhil, and PhD programs in Information Technology and Decision Sciences. Our curriculum covers areas like AI/ML, web development, mobile computing, networking, and data science.",
  },
  {
    question: "How can I contact the department?",
    answer:
      "You can reach us via email at itds@uenr.edu.gh, call our office during working hours, or visit us at the School of Sciences building on campus.",
  },
  {
    question: "What research areas does the department focus on?",
    answer:
      "Our research spans Artificial Intelligence & Machine Learning, Web & Software Engineering, Mobile Computing, Cybersecurity, Data Science, and IoT. Students can choose from these areas for their project work and postgraduate research.",
  },
  {
    question: "How do I submit a student project?",
    answer:
      "Student projects are submitted through the Student Project Management System (SPMS). Supervisors provide access credentials. Contact the department office for guidance on submission deadlines and requirements.",
  },
  {
    question: "Are there opportunities for industry collaboration?",
    answer:
      "Yes, we actively partner with industry organizations for internships, research collaborations, and guest lectures. Our alumni network spans leading tech companies across Ghana and beyond.",
  },
];

export default function FAQSection({
  faqs = defaultFAQs,
}: {
  faqs?: FAQItem[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-paper py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Left — heading + CTA */}
          <div className="lg:col-span-2">
            <div className="sticky top-28">
              <span className="inline-flex items-center gap-2 rounded-lg bg-gold-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-600">
                <MessageCircle className="h-4 w-4" />
                FAQs
              </span>
              <h2 className="display-heading mt-5 text-3xl font-extrabold uppercase tracking-tight text-forest-950 sm:text-4xl">
                Questions? Look here.
              </h2>
              <p className="mt-4 text-ink-soft">
                Can&apos;t find what you&apos;re looking for? Feel free to reach out to our
                department directly.
              </p>
              <div className="mt-8 rounded-xl border border-forest-100 bg-forest-950 p-6">
                <p className="text-sm font-semibold text-white">You have different questions?</p>
                <p className="mt-1 text-sm text-white/70">
                  Our department team will answer all of your questions.
                </p>
                <a
                  href="/contact"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-gold-600 hover:shadow-lg hover:shadow-gold-500/25"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>

          {/* Right — accordion */}
          <div className="lg:col-span-3">
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl border transition-all duration-300",
                    openIndex === i
                      ? "border-forest-200 bg-white shadow-lg shadow-forest-950/5"
                      : "border-forest-100 bg-white hover:border-forest-200"
                  )}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-display text-base font-bold text-forest-950">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-ink-soft transition-transform duration-300",
                        openIndex === i && "rotate-180 text-gold-500"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      openIndex === i ? "max-h-96 pb-6" : "max-h-0"
                    )}
                  >
                    <div className="px-6">
                      <div className="border-t border-forest-100 pt-4">
                        <p className="text-sm leading-relaxed text-ink-soft">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
