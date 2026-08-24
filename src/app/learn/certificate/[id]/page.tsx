import { notFound } from "next/navigation";
import { requireLearner } from "@/lib/learn-auth";
import { prisma } from "@/lib/prisma";
import CertificateView from "@/components/learn/CertificateView";

export const metadata = { title: "Certificate" };

export default async function CertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const learner = await requireLearner();
  const { id } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: { subject: { select: { name: true } } },
  });

  if (!certificate || certificate.learnerId !== learner.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-paper py-8 print:bg-white print:p-0">
      <CertificateView
        certificate={{
          certificateNo: certificate.certificateNo,
          issuedAt: certificate.issuedAt.toISOString(),
          learnerName: learner.name,
          subjectName: certificate.subject.name,
        }}
      />
    </div>
  );
}
