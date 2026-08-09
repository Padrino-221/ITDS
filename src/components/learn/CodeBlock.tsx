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
    <div className={`relative mt-4 w-full max-w-full overflow-x-hidden ${className ?? ""}`}>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Code copied" : "Copy code"}
        title={copied ? "Copied" : "Copy code"}
        className="absolute right-1.5 top-1.5 z-10 inline-flex items-center justify-center gap-1 rounded-md bg-white/10 p-1.5 text-emerald-200 transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/70 sm:right-2.5 sm:top-2.5 sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-[11px] sm:font-bold sm:uppercase sm:tracking-wider"
      >
        {copied ? (
          <Check className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" />
        ) : (
          <Copy className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" />
        )}
        <span className="hidden sm:inline">{copied ? "Copied" : language ?? "Copy"}</span>
      </button>
      <pre className="max-w-full overflow-x-auto overscroll-x-contain rounded-xl bg-forest-950 p-3 pr-10 pt-9 text-[13px] leading-relaxed text-emerald-100 sm:p-4 sm:pr-14 sm:pt-11">
        <code className="block min-w-full whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}
