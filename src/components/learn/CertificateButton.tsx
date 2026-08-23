"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Award, ExternalLink, Loader2, Lock } from "lucide-react";
import { learnUrl } from "@/lib/utils";

type EligibilityResult = {
  eligible: boolean;
  hasCertificate: boolean;
  certificate?: { id: string } | null;
  reason?: string;
  completed?: number;
  total?: number;
  examsPassed?: number;
  examsTotal?: number;
};

export default function CertificateButton({
  subjectId,
  subjectName,
  certificatePrice,
}: {
  subjectId: string;
  subjectName: string;
  certificatePrice: number | null;
}) {
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);

  const checkEligibility = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/learn/certificate/check?subjectId=${subjectId}`);
      setEligibility(await res.json());
    } catch {
      setEligibility({ eligible: false, hasCertificate: false, reason: "Failed to check eligibility." });
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  // Check automatically so learners see their status without an extra click.
  useEffect(() => {
    if (!certificatePrice) return;
    checkEligibility();
  }, [certificatePrice, checkEligibility]);

  async function handlePayment() {
    setPaying(true);
    try {
      const res = await fetch(`/api/learn/certificate/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId }),
      });
      const data = await res.json();
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      }
    } catch {
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  // Don't show if no price is set
  if (!certificatePrice) return null;

  const priceGHS = (certificatePrice / 100).toFixed(2);

  return (
    <div className="rounded-2xl border border-gold-200 bg-gold-50 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-100">
          <Award className="h-6 w-6 text-gold-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-lg font-extrabold text-forest-950">
            Certificate of Completion
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            Earn a verified certificate for completing all lessons and passing all
            exams in {subjectName}. Price:{" "}
            <span className="font-bold text-gold-700">GHS {priceGHS}</span>
          </p>

          {loading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking your progress…
            </div>
          )}

          {!loading && eligibility && (
            <div className="mt-4">
              {eligibility.hasCertificate && eligibility.certificate ? (
                <Link
                  href={learnUrl(`/certificate/${eligibility.certificate.id}`)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
                >
                  <Award className="h-4 w-4" />
                  View your certificate
                  <ExternalLink className="h-4 w-4" />
                </Link>
              ) : eligibility.eligible ? (
                <button
                  onClick={handlePayment}
                  disabled={paying}
                  className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-gold-600 hover:shadow-lg hover:shadow-gold-500/25 disabled:opacity-50"
                >
                  {paying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pay GHS {priceGHS} to get certificate
                    </>
                  )}
                </button>
              ) : (
                <div>
                  <p className="text-sm text-gold-700">{eligibility.reason}</p>
                  {(eligibility.completed !== undefined ||
                    eligibility.examsPassed !== undefined) && (
                    <div className="mt-2 space-y-1.5">
                      {eligibility.completed !== undefined &&
                        eligibility.total !== undefined && (
                          <ProgressRow
                            label={`${eligibility.completed}/${eligibility.total} lessons completed`}
                            value={eligibility.completed}
                            max={eligibility.total}
                          />
                        )}
                      {eligibility.examsPassed !== undefined &&
                        eligibility.examsTotal !== undefined && (
                          <ProgressRow
                            label={`${eligibility.examsPassed}/${eligibility.examsTotal} exams passed`}
                            value={eligibility.examsPassed}
                            max={eligibility.examsTotal}
                          />
                        )}
                    </div>
                  )}
                  <button
                    onClick={checkEligibility}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700 underline underline-offset-2 hover:text-gold-800"
                  >
                    Recheck progress
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  return (
    <div>
      <div className="h-2 w-48 overflow-hidden rounded-full bg-gold-200">
        <div
          className="h-full bg-gold-500 transition-all"
          style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gold-600">{label}</p>
    </div>
  );
}
