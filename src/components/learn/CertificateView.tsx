"use client";

import { useRef } from "react";
import { Download, Link2 } from "lucide-react";

type CertificateData = {
  certificateNo: string;
  issuedAt: string;
  learnerName: string;
  subjectName: string;
  amountPaid: number;
};

export default function CertificateView({
  certificate,
}: {
  certificate: CertificateData;
}) {
  const certRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    window.print();
  }

  async function handleCopyVerifyLink() {
    const path = `/learn/verify?no=${encodeURIComponent(certificate.certificateNo)}`;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — non-critical.
    }
  }

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const siteHost = (() => {
    try {
      return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://itdsuenr.com").host;
    } catch {
      return "itdsuenr.com";
    }
  })();
  const amountGHS = (certificate.amountPaid / 100).toFixed(2);

  return (
    <div>
      {/* Print button - hidden when printing */}
      <div className="no-print mb-6 flex justify-end gap-3">
        <button
          onClick={handleCopyVerifyLink}
          className="inline-flex items-center gap-2 rounded-xl border border-forest-200 bg-white px-6 py-3 text-sm font-bold text-forest-900 transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-lg"
        >
          <Link2 className="h-4 w-4" />
          Copy verification link
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl bg-forest-950 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lg"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </div>

      {/* Certificate */}
      <div
        ref={certRef}
        className="certificate-container mx-auto max-w-[800px] bg-white"
        style={{
          border: "3px solid #1a3a2a",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Decorative border */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            right: "12px",
            bottom: "12px",
            border: "1px solid #c9a84c",
            pointerEvents: "none",
          }}
        />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#666", letterSpacing: "3px", textTransform: "uppercase" }}>
            Department of Information Technology and Decision Sciences
          </div>
          <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
            University of Energy and Natural Resources, Sunyani, Ghana
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "800",
              color: "#1a3a2a",
              letterSpacing: "2px",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Certificate of Completion
          </h1>
          <div
            style={{
              width: "100px",
              height: "3px",
              background: "#c9a84c",
              margin: "16px auto 0",
            }}
          />
        </div>

        {/* Body */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p style={{ fontSize: "16px", color: "#555", margin: "0 0 16px" }}>
            This is to certify that
          </p>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#1a3a2a",
              margin: "0 0 16px",
              fontStyle: "italic",
            }}
          >
            {certificate.learnerName}
          </h2>
          <p style={{ fontSize: "16px", color: "#555", margin: "0 0 8px" }}>
            has successfully completed all requirements for the course
          </p>
          <h3
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#c9a84c",
              margin: "0 0 16px",
            }}
          >
            {certificate.subjectName}
          </h3>
          <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
            including all lessons, topics, and assessments.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: "60px",
            paddingTop: "20px",
            borderTop: "1px solid #e5e5e5",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "150px",
                borderBottom: "1px solid #333",
                marginBottom: "8px",
              }}
            />
            <div style={{ fontSize: "12px", color: "#666" }}>
              Head of Department
            </div>
            <div style={{ fontSize: "11px", color: "#888" }}>
              ITDS, UENR
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>
              Certificate No: {certificate.certificateNo}
            </div>
            <div style={{ fontSize: "11px", color: "#888" }}>
              Date: {issuedDate}
            </div>
            <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
              Verify: {siteHost}/learn/verify?no={certificate.certificateNo}
            </div>
            <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
              Amount Paid: GHS {amountGHS}
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "150px",
                borderBottom: "1px solid #333",
                marginBottom: "8px",
              }}
            />
            <div style={{ fontSize: "12px", color: "#666" }}>
              Course Instructor
            </div>
            <div style={{ fontSize: "11px", color: "#888" }}>
              E-Learning Hub
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx>{`\n        @media print {\n          .no-print {\n            display: none !important;\n          }\n          body {\n            margin: 0;\n            padding: 0;\n          }\n          .certificate-container {\n            border: 3px solid #1a3a2a !important;\n            box-shadow: none !important;\n            margin: 0 !important;\n            max-width: 100% !important;\n            page-break-inside: avoid;\n          }\n        }\n      `}</style>
    </div>
  );
}
