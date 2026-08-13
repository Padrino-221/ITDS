"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { baseInput } from "./ui";

/** Password input with a show/hide toggle (a client component). */
export default function PasswordInput({
  icon,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft">
          {icon}
        </span>
      )}
      <input
        {...rest}
        type={visible ? "text" : "password"}
        className={cn(baseInput, icon ? "pl-10" : undefined, "pr-11", className)}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-soft transition-colors hover:bg-forest-50 hover:text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
