"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Award, Check, Download, Link2, Loader2 } from "lucide-react";

type CertificateData = {
  certificateNo: string;
  issuedAt: string;
  learnerName: string;
  subjectName: string;
};

export default function CertificateView({
  certificate,
}: {
  certificate: CertificateData;
}) {
  const certRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloadState, setDownloadState] = useState<
    "idle" | "working" | "error"
  >("idle");
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function buildVerifyUrl() {
    const path = `/learn/verify?no=${encodeURIComponent(certificate.certificateNo)}`;
    return `${window.location.origin}${path}`;
  }

  async function handleCopyVerifyLink() {
    const url = await buildVerifyUrl();
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fall back.
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        ta.remove();
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    }
  }

  async function loadAsBase64(path: string) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`${path} unavailable`);
    const buf = new Uint8Array(await res.arrayBuffer());
    let bin = "";
    const chunk = 0x8000;
    for (let i = 0; i < buf.length; i += chunk) {
      bin += String.fromCharCode(...buf.subarray(i, i + chunk));
    }
    return btoa(bin);
  }

  async function handleDownloadPdf() {
    if (downloadState === "working") return;
    setDownloadState("working");
    try {
      const { default: JsPDF } = await import("jspdf");
      const pdf = new JsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      // Embed the site's brand fonts so all text is vector & selectable.
      try {
        const [sgBold, pjsReg, pjsSemi, pjsBold] = await Promise.all([
          loadAsBase64("/fonts/sg-bold.ttf"),
          loadAsBase64("/fonts/pjs-regular.ttf"),
          loadAsBase64("/fonts/pjs-semibold.ttf"),
          loadAsBase64("/fonts/pjs-bold.ttf"),
        ]);
        pdf.addFileToVFS("sg-bold.ttf", sgBold);
        pdf.addFont("sg-bold.ttf", "SpaceGrotesk", "bold");
        pdf.addFileToVFS("pjs-regular.ttf", pjsReg);
        pdf.addFont("pjs-regular.ttf", "Jakarta", "normal");
        pdf.addFileToVFS("pjs-semibold.ttf", pjsSemi);
        pdf.addFont("pjs-semibold.ttf", "Jakarta", "semibold");
        pdf.addFileToVFS("pjs-bold.ttf", pjsBold);
        pdf.addFont("pjs-bold.ttf", "Jakarta", "bold");
      } catch {
        // Fall back to built-in Helvetica if fonts cannot be fetched.
      }

      const W = 297;
      const H = 210;
      const CX = W / 2;
      const FOREST_950 = "#0d2358";
      const FOREST_900 = "#0a1d49";
      const INK_SOFT = "#5a6a8a";
      const INK_SOFT_SOFT = "#808ca5";
      const GOLD_600 = "#d12655";
      const GOLD_500 = "#ec3b6a";
      const GOLD_400 = "#f05f8d";
      const GOLD_300 = "#f284a9";
      const NAVY_60 = "#6b79a0";

      const display = (size: number, color: string) => {
        pdf.setFont("SpaceGrotesk", "bold").setFontSize(size).setTextColor(color);
      };
      const body = (
        size: number,
        color: string,
        style: "normal" | "semibold" | "bold" = "semibold"
      ) => {
        pdf.setFont("Jakarta", style).setFontSize(size).setTextColor(color);
      };

      // Centering helper — jsPDF's align:"center" ignores charSpace, which
      // shifts letter-spaced text off centre. Measure the true visual width
      // (including inter-character space) and draw from a manual left offset.
      const centerText = (
        text: string,
        y: number,
        charSpace = 0,
        at: number = CX
      ) => {
        const w =
          pdf.getTextWidth(text) +
          (text.length > 1 ? (text.length - 1) * charSpace : 0);
        pdf.text(text, at - w / 2, y, { align: "left", charSpace });
      };

      // Frame
      pdf.setDrawColor(FOREST_950).setLineWidth(1.3);
      pdf.rect(0.65, 0.65, W - 1.3, H - 1.3);
      pdf.setDrawColor(GOLD_300).setLineWidth(0.3);
      pdf.rect(4.5, 4.5, W - 9, H - 9);

      // Corner ticks
      pdf.setDrawColor(GOLD_500).setLineWidth(1.05);
      const t = 9.5;
      const o = 0.65;
      pdf.line(o, o, o + t, o); pdf.line(o, o, o, o + t);
      pdf.line(W - o, o, W - o - t, o); pdf.line(W - o, o, W - o, o + t);
      pdf.line(o, H - o, o + t, H - o); pdf.line(o, H - o, o, H - o - t);
      pdf.line(W - o, H - o, W - o - t, H - o); pdf.line(W - o, H - o, W - o, H - o - t);

      // Logo (pre-shrunk 480px copy — see public/itds-logo-embed.png)
      const logoW = 17;
      const logoH = logoW * (2592 / 2598);
      try {
        const logoB64 = await loadAsBase64("/itds-logo-embed.png");
        pdf.addImage(logoB64, "PNG", CX - logoW / 2, 10.5, logoW, logoH);
      } catch {
        // Logo optional — certificate remains valid without it.
      }

      // Header lines
      body(8.25, INK_SOFT);
      centerText(
        "DEPARTMENT OF INFORMATION TECHNOLOGY & DECISION SCIENCES",
        34.5,
        1.65
      );
      body(7.5, INK_SOFT_SOFT);
      centerText(
        "UNIVERSITY OF ENERGY AND NATURAL RESOURCES · SUNYANI, GHANA",
        40,
        1.35
      );

      // Award motif — medal icon between rules (traced from lucide `Award`)
      pdf.setDrawColor(GOLD_400).setLineWidth(0.45);
      pdf.line(CX - 34, 52.5, CX - 6.8, 52.5);
      pdf.line(CX + 6.8, 52.5, CX + 34, 52.5);
      {
        const k = 6.6 / 24; // lucide viewBox (24) scaled to ~6.6mm
        const x0 = CX;
        const y0 = 52.5 - 3.3;
        const px = (u: number) => x0 + u * k - 3.3;
        const py = (v: number) => y0 + v * k;
        pdf.setDrawColor(GOLD_500).setLineWidth(0.5).setLineCap("round").setLineJoin("round");
        // Medal circle: <circle cx="12" cy="8" r="6"/>
        pdf.circle(px(12), py(8), 6 * k);
        // Ribbon: M15.477 12.89 L17 22 L12 19 L7 22 L8.533 12.89
        const ribbon: Array<[number, number]> = [
          [15.477, 12.89],
          [17, 22],
          [12, 19],
          [7, 22],
          [8.533, 12.89],
        ];
        for (let i = 0; i < ribbon.length - 1; i++) {
          pdf.line(
            px(ribbon[i][0]),
            py(ribbon[i][1]),
            px(ribbon[i + 1][0]),
            py(ribbon[i + 1][1])
          );
        }
      }

      display(30, FOREST_950);
      centerText("CERTIFICATE OF COMPLETION", 67, 1.1);

      body(9, INK_SOFT);
      centerText("THIS IS TO CERTIFY THAT", 83, 2.3);

      display(34, FOREST_950);
      centerText(certificate.learnerName.toUpperCase(), 100);

      body(10.5, INK_SOFT, "normal");
      centerText(
        "has successfully completed all lessons and passed all course examinations for",
        111
      );

      display(21, GOLD_600);
      centerText(certificate.subjectName.toUpperCase(), 123);

      body(9, INK_SOFT_SOFT);
      centerText("ITDS E-LEARNING HUB", 131, 1.6);

      // Footer
      pdf.setDrawColor("#d9e1f4").setLineWidth(0.4);
      pdf.line(22, 167, W - 22, 167);

      const cols = [64, CX, 233];
      pdf.setDrawColor(NAVY_60).setLineWidth(0.35);
      for (const cx of [cols[0], cols[2]]) {
        pdf.line(cx - 23, 177, cx + 23, 177);
      }
      display(9, FOREST_950);
      centerText("HEAD OF DEPARTMENT", 184, 0.4, cols[0]);
      centerText("COURSE INSTRUCTOR", 184, 0.4, cols[2]);
      body(7, INK_SOFT_SOFT);
      centerText("ITDS · UENR", 190, 0.8, cols[0]);
      centerText("E-LEARNING HUB", 190, 0.8, cols[2]);

      pdf.setFont("courier", "bold").setFontSize(8.5).setTextColor(FOREST_900);
      centerText(certificate.certificateNo, 183, 0.6);
      body(8, INK_SOFT);
      centerText(`ISSUED ${issuedDate.toUpperCase()}`, 190, 1);

      pdf.save(`ITDS-Certificate-${certificate.certificateNo}.pdf`);
      setDownloadState("idle");
    } catch {
      setDownloadState("error");
      setTimeout(() => setDownloadState("idle"), 2500);
    }
  }

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* Certificate — standard A4 landscape (297×210mm) at every breakpoint.
          On phones it scales down as a whole (same landscape shape); in print
          the exact mm dimensions take over and fill the page. */}
      <div
        ref={certRef}
        className="certificate-container relative mx-auto flex aspect-[297/210] w-full max-w-[900px] flex-col overflow-hidden bg-white px-4 pb-3 pt-4 text-center sm:px-16 sm:pb-8 sm:pt-9 print:h-[210mm] print:max-w-none print:w-[297mm]"
        style={{ border: "4px solid var(--color-forest-950)" }}
      >
        {/* Inner accent frame */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-2 border border-gold-300 sm:inset-3"
        />
        {/* Corner ticks */}
        {(
          [
            "-top-1 -left-1 border-t-[3px] border-l-[3px]",
            "-top-1 -right-1 border-t-[3px] border-r-[3px]",
            "-bottom-1 -left-1 border-b-[3px] border-l-[3px]",
            "-bottom-1 -right-1 border-b-[3px] border-r-[3px]",
          ] as const
        ).map((pos) => (
          <div
            key={pos}
            aria-hidden
            className={`absolute z-10 h-5 w-5 border-gold-500 sm:h-8 sm:w-8 ${pos}`}
          />
        ))}

        {/* Header */}
        <div className="flex flex-col items-center">
          <Image
            src="/itds-logo.png"
            alt=""
            width={56}
            height={56}
            className="h-8 w-8 rounded-lg object-cover sm:h-14 sm:w-14 sm:rounded-xl"
          />
          <p className="mt-2 whitespace-nowrap px-2 text-[8px] font-bold uppercase leading-tight tracking-[0.12em] text-ink-soft sm:mt-3 sm:text-[11px] sm:tracking-[0.22em]">
            Department of Information Technology &amp; Decision Sciences
          </p>
          <p className="mt-0.5 hidden whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.14em] text-ink-soft/80 sm:block sm:text-[10px] sm:tracking-[0.18em]">
            University of Energy and Natural Resources · Sunyani, Ghana
          </p>
        </div>

        {/* Middle — vertically centred in the remaining space */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <span aria-hidden className="h-px w-8 bg-gold-400 sm:w-20" />
            <Award className="h-3.5 w-3.5 text-gold-500 sm:h-5 sm:w-5" />
            <span aria-hidden className="h-px w-8 bg-gold-400 sm:w-20" />
          </div>
          <h1 className="mt-1.5 font-display text-sm font-extrabold uppercase leading-tight tracking-wide text-forest-950 sm:mt-3 sm:text-[40px]">
            Certificate of Completion
          </h1>

          <p className="mt-2 text-[7px] font-semibold uppercase tracking-[0.18em] text-ink-soft sm:mt-7 sm:text-xs sm:tracking-[0.26em]">
            This is to certify that
          </p>
          <h2 className="mt-1 font-display text-lg font-extrabold tracking-tight text-forest-950 sm:mt-3 sm:text-5xl">
            {certificate.learnerName}
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-[8px] leading-snug text-ink-soft sm:mt-5 sm:text-sm sm:leading-relaxed">
            has successfully completed all lessons and passed all course
            examinations for
          </p>
          <h3 className="mt-1 font-display text-xs font-extrabold text-gold-600 sm:mt-2 sm:text-3xl">
            {certificate.subjectName}
          </h3>
          <p className="mt-1 text-[7px] font-semibold uppercase tracking-[0.14em] text-ink-soft/80 sm:mt-2 sm:text-xs sm:tracking-[0.18em]">
            ITDS E-Learning Hub
          </p>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-3 items-end gap-2 border-t border-forest-100 pt-2 sm:gap-4 sm:pt-6">
          <div className="text-center">
            <div className="mx-auto mb-1 w-full max-w-[110px] border-b border-forest-950/60 sm:mb-2 sm:max-w-[150px]" />
            <p className="font-display text-[7px] font-extrabold text-forest-950 sm:text-xs">
              Head of Department
            </p>
            <p className="text-[6px] uppercase tracking-wider text-ink-soft/80 sm:mt-0.5 sm:text-[10px]">
              ITDS · UENR
            </p>
          </div>
          <div className="text-center">
            <p className="font-mono text-[7px] font-semibold tracking-wide text-forest-900 sm:text-[11px]">
              {certificate.certificateNo}
            </p>
            <p className="text-[6px] font-semibold uppercase tracking-wider text-ink-soft sm:mt-1 sm:text-[11px]">
              Issued {issuedDate}
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-1 w-full max-w-[110px] border-b border-forest-950/60 sm:mb-2 sm:max-w-[150px]" />
            <p className="font-display text-[7px] font-extrabold text-forest-950 sm:text-xs">
              Course Instructor
            </p>
            <p className="text-[6px] uppercase tracking-wider text-ink-soft/80 sm:mt-0.5 sm:text-[10px]">
              E-Learning Hub
            </p>
          </div>
        </div>
      </div>

      {/* Actions — below the certificate */}
      <div className="no-print mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          onClick={handleCopyVerifyLink}
          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg ${
            copied
              ? "border-gold-400 bg-gold-500/10 text-gold-700"
              : "border-forest-200 bg-white text-forest-900 hover:border-gold-300"
          }`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy verification link"}
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={downloadState === "working"}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-gold-600 hover:shadow-lg hover:shadow-gold-500/25 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {downloadState === "working" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing…
            </>
          ) : downloadState === "error" ? (
            "Failed — try again"
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* Print styles */}
      <style jsx>{`
        @page {
          size: A4 landscape;
          margin: 0;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .certificate-container {
            box-shadow: none !important;
            margin: 0 auto !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
