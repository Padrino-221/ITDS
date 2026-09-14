"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  Clock,
  ExternalLink,
  Loader2,
  LogIn,
  Mail,
  Phone,
  Printer,
} from "lucide-react";
import { learnUrl } from "@/lib/utils";
import { claimCertificate } from "@/app/learn/actions";

type EligibilityResult = {
  eligible: boolean;
  hasCertificate: boolean;
  certificate?: { id: string } | null;
  reason?: string;
  completed?: number;
  total?: number;
  examsPassed?: number;
  examsTotal?: number;
  needsAuth?: boolean;
};

export type CertificateContact = {
  phone: string;
  email: string;
  hours?: string;
};

export default function CertificateButton({
  subjectId,
  subjectName,
  contact,
}: {
  subjectId: string;
  subjectName: string;
  contact: CertificateContact;
}) {
  const router = useRouter();
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEligibility = useCallback(async () => {
    try {
      const res = await fetch(`/api/learn/certificate/check?subjectId=${subjectId}`);
      if (res.status === 401) {
        setEligibility({ eligible: false, hasCertificate: false, needsAuth: true });
        return;
      }
      setEligibility(await res.json());
    } catch {
      setEligibility({
        eligible: false,
        hasCertificate: false,
        reason: "Failed to check eligibility.",
      });
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  // Check automatically so learners see their status without an extra click.
  useEffect(() => {
    // fetchEligibility() only calls setState after its awaited fetch resolves,
    // so nothing is set synchronously — the rule can't prove that statically.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchEligibility();
  }, [fetchEligibility]);

  function recheck() {
    setLoading(true);
    fetchEligibility();
  }

  async function handleClaim() {
    setClaiming(true);
    setError(null);
    try {
      const result = await claimCertificate(subjectId);
      if (result.ok) {
        router.push(learnUrl(`/certificate/${result.id}`));
      } else {
        setError(result.error);
        fetchEligibility();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setClaiming(false);
    }
  }

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
            Complete all lessons and pass all exams in {subjectName} to earn
            your <span className="font-bold text-gold-700">free certificate</span>.
          </p>

          {loading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking your progress…
            </div>
          )}

          {!loading && eligibility && (
            <div className="mt-4">
              {eligibility.needsAuth ? (
                <Link
                  href={learnUrl("/account/signin")}
                  className="inline-flex items-center gap-2 rounded-xl bg-forest-950 px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lg"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in to earn your certificate
                </Link>
              ) : eligibility.hasCertificate && eligibility.certificate ? (
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
                  onClick={handleClaim}
                  disabled={claiming}
                  className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-gold-600 hover:shadow-lg hover:shadow-gold-500/25 disabled:opacity-50"
                >
                  {claiming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Issuing…
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4" />
                      Get your free certificate
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
                    onClick={recheck}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700 underline underline-offset-2 hover:text-gold-800"
                  >
                    Recheck progress
                  </button>
                </div>
              )}

              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </div>
          )}

          <HardCopyNote contact={contact} />
        </div>
      </div>
    </div>
  );
}

function HardCopyNote({ contact }: { contact: CertificateContact }) {
  return (
    <div className="mt-4 rounded-xl border border-gold-200 bg-white/60 p-3">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gold-700">
        <Printer className="h-3.5 w-3.5" />
        Need a printed copy?
      </p>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">
        The soft copy is free. To request a hard copy, call the department — payment
        for printed copies is arranged directly with the department.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
        <a
          href={`tel:${contact.phone.replace(/\s/g, "")}`}
          className="inline-flex items-center gap-1.5 font-semibold text-forest-900 hover:text-gold-700"
        >
          <Phone className="h-3.5 w-3.5" />
          {contact.phone}
        </a>
        <a
          href={`mailto:${contact.email}`}
          className="inline-flex items-center gap-1.5 font-semibold text-forest-900 hover:text-gold-700"
        >
          <Mail className="h-3.5 w-3.5" />
          {contact.email}
        </a>
        {contact.hours && (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {contact.hours}
          </span>
        )}
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
