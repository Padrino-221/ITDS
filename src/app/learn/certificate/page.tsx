import Link from "next/link";
import { Award, ArrowLeft, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { requireLearner } from "@/lib/learn-auth";
import { prisma } from "@/lib/prisma";
import { learnUrl } from "@/lib/utils";

export const metadata = { title: "My Certificates" };

export default async function CertificatesPage() {
  const learner = await requireLearner();

  const certificates = await prisma.certificate.findMany({
    where: { learnerId: learner.id },
    include: { subject: { select: { name: true, slug: true } } },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="My Certificates"
        subtitle="Certificates earned from completing courses on the E-Learning Hub."
        crumbs={[
          { label: "Home", href: learnUrl("/") },
          { label: "Learn", href: learnUrl("/") },
          { label: "Certificates" },
        ]}
      />

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <Link
          href={learnUrl("/")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-forest-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>

        {certificates.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-forest-200 bg-white px-6 py-16 text-center">
            <Award className="mx-auto h-8 w-8 text-forest-200" />
            <p className="mt-3 font-display text-lg font-bold text-forest-900">
              No certificates yet
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Complete all lessons in a course to earn a certificate.
            </p>
            <Link
              href={learnUrl("/")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-gold-600 hover:shadow-lg"
            >
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-forest-100 bg-white p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gold-50">
                    <Award className="h-7 w-7 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-forest-950">
                      {cert.subject.name}
                    </h3>
                    <p className="text-sm text-ink-soft">
                      Certificate No: {cert.certificateNo}
                    </p>
                    <p className="text-xs text-ink-soft">
                      Issued:{" "}
                      {new Date(cert.issuedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Link
                  href={learnUrl(`/certificate/${cert.id}`)}
                  className="inline-flex items-center gap-2 rounded-xl bg-forest-950 px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lg"
                >
                  View Certificate
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
