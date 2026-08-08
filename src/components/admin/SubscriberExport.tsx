"use client";

import { Download } from "lucide-react";

export default function SubscriberExport({
  subscribers,
}: {
  subscribers: Array<{ email: string; createdAt: Date | string }>;
}) {
  const handleExport = () => {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = [
      "email,subscribed_at",
      ...subscribers.map((s) => `${escape(s.email)},${new Date(s.createdAt).toISOString()}`),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "newsletter-subscribers.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={subscribers.length === 0}
      className="inline-flex items-center gap-2 rounded-lg border border-forest-200 bg-white px-4 py-2.5 text-sm font-semibold text-forest-800 transition-colors hover:border-forest-400 disabled:opacity-50"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </button>
  );
}
