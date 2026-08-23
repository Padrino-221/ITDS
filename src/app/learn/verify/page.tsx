import { BadgeCheck, SearchX, ShieldCheck } from "lucide-react";
import { getCertificateForVerification } from "@/lib/learn";
import { learnUrl } from "@/lib/utils";

export const metadata = {
  title: "Verify a Certificate",
  description:
    "Verify the authenticity of an ITDS E-Learning Hub certificate by its certificate number.",
};

export const dynamic = "force-dynamic";

export default async function VerifyCertificatePage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string }>;
}) {
  const { no } = await searchParams;
  const query = (no ?? "").trim().toUpperCase();

  // Auth-free by design: employers and third parties verify certificates
  // without an account. The lookup returns public-safe fields only.
  const result = query
    ? await getCertificateForVerification(query)
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-950">
          <ShieldCheck className="h-7 w-7 text-gold-400" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-extrabold text-forest-950 sm:text-4xl">
          Verify a Certificate
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          Enter the certificate number printed on any ITDS E-Learning Hub
          certificate to confirm it was genuinely issued by the Department of
          Information Technology and Decision Sciences, UENR.
        </p>
      </div>

      <form
        method="get"
        action={learnUrl("/verify")}
        className="mt-8 flex flex-col gap-3 rounded-2xl border border-forest-100 bg-white p-6 sm:flex-row"
      >
        <input
          type="text"
          name="no"
          defaultValue={query}
          placeholder="e.g. ITDS-2026-ART-001"
          autoComplete="off"
          spellCheck={false}
          aria-label="Certificate number"
          className="flex-1 rounded-xl border border-forest-200 bg-white px-4 py-3 font-mono text-sm uppercase tracking-wide text-forest-950 placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-soft/60 outline-none transition-all focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
        />
        <button
          type="submit"
          className="rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-gold-600 hover:shadow-lg hover:shadow-gold-500/25"
        >
          Verify
        </button>
      </form>

      {query && !result && (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-6" role="alert">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
              <SearchX className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h2 className="font-display text-base font-extrabold text-red-700">
                No certificate found
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-red-600/90">
                We couldn&apos;t find a certificate with number{" "}
                <span className="font-mono font-bold">{query}</span>. Check for
                typos (including dashes) or contact the holder to confirm the
                number.
              </p>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6" role="status">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
              <BadgeCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-base font-extrabold text-emerald-700">
                Verified — this certificate is genuine
              </h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-semibold text-ink-soft">Issued to</dt>
                  <dd className="font-bold text-forest-950">{result.learnerName}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-semibold text-ink-soft">Course</dt>
                  <dd className="font-bold text-forest-950">{result.subjectName}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-semibold text-ink-soft">Issued on</dt>
                  <dd className="font-bold text-forest-950">
                    {new Date(result.issuedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </dd>
                </div>
                <div className="flex flex-wrap gap-x-2">
                  <dt className="font-semibold text-ink-soft">Certificate No</dt>
                  <dd className="font-mono font-bold text-forest-950">{result.certificateNo}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-xs leading-relaxed text-ink-soft/80">
        Certificates are issued only after a learner completes every lesson,
        passes every course exam, and settles the certification fee.
      </p>
    </div>
  );
}
