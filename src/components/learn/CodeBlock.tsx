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
        className="absolute right-2 top-2 z-10 flex items-center justify-center rounded-lg bg-white/10 p-1.5 text-emerald-200 transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70 sm:right-2.5 sm:top-2.5 sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-[11px] sm:font-bold sm:uppercase sm:tracking-wider"
      >
        {copied ? (
          <Check className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" />
        ) : (
          <Copy className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" />
        )}
        <span className="hidden sm:inline">{copied ? "Copied" : language ?? "Copy"}</span>
      </button>
      <pre className="overflow-x-auto rounded-xl bg-forest-950 p-4 pr-14 pt-11 text-[13px] leading-relaxed text-emerald-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
