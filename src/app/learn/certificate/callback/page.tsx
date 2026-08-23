import Link from "next/link";
import { redirect } from "next/navigation";
import { XCircle, ArrowLeft } from "lucide-react";
import { requireLearner } from "@/lib/learn-auth";
import { prisma } from "@/lib/prisma";
import { verifyCertificatePayment } from "@/app/learn/actions";
import { learnUrl } from "@/lib/utils";

export const metadata = { title: "Payment Callback" };

export default async function CertificateCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string; error?: string }>;
}) {
  const learner = await requireLearner();
  const { reference, trxref, error: urlError } = await searchParams;

  // Handle error params from Paystack redirect
  if (urlError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-extrabold text-forest-950">
            Payment Error
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {urlError === "no_reference"
              ? "No payment reference was provided. Please try again."
              : "Your payment could not be processed. Please try again."}
          </p>
          <Link
            href={learnUrl("/")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-forest-950 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  const ref = reference || trxref;
  if (!ref) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-extrabold text-forest-950">
            Missing Reference
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            No payment reference was provided. Please try the payment again.
          </p>
          <Link
            href={learnUrl("/")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-forest-950 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  // Check if certificate was already issued by the webhook
  const existing = await prisma.certificate.findUnique({
    where: { paystackRef: ref },
  });
  if (existing && existing.learnerId === learner.id) {
    redirect(learnUrl(`/certificate/${existing.id}`));
  }

  // redirect() signals success by throwing NEXT_REDIRECT, so it must run
  // OUTSIDE this try/catch — otherwise the catch below swallows it and
  // renders "Payment Verification Failed" after a successful payment.
  let certificateId: string;
  try {
    const certificate = await verifyCertificatePayment(ref);
    certificateId = certificate.id;
  } catch {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-extrabold text-forest-950">
            Payment Verification Failed
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            We couldn&apos;t verify your payment. If you were charged, please
            contact support and provide reference:{" "}
            <span className="font-mono text-forest-900">{ref}</span>
          </p>
          <Link
            href={learnUrl("/")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-forest-950 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to courses
          </Link>
        </div>
      </div>
    );
  }
  redirect(learnUrl(`/certificate/${certificateId}`));
}
