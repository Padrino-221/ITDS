"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeBlock({
  code,
  language,
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — ignore silently.
    }
  }

  return (
    <div className={`relative mt-4 ${className ?? ""}`}>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Code copied" : "Copy code"}
        title={copied ? "Copied" : "Copy code"}
        className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 sm:gap-1.5 rounded-lg bg-white/10 px-2 py-1.5 sm:px-2.5 text-[11px] font-bold uppercase tracking-wider text-emerald-200 transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70"
      >
        {copied ? <Check className="h-3.5 w-3.5 shrink-0" /> : <Copy className="h-3.5 w-3.5 shrink-0" />}
        <span className="hidden sm:inline">{copied ? "Copied" : language ?? "Copy"}</span>
      </button>
      <pre className="overflow-x-auto rounded-xl bg-forest-950 p-4 pr-14 pt-11 text-[13px] leading-relaxed text-emerald-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
