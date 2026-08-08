"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CircleUserRound,
  LogOut,
  Menu,
  PenLine,
  ShieldCheck,
  X,
} from "lucide-react";
import type { SessionRole, SessionUser } from "@/lib/auth";
import { signout } from "@/app/learn/actions";

const ROLE_LABELS: Record<SessionRole, string> = {
  STUDENT: "Learner",
  LECTURER: "Lecturer",
  EDITOR: "Editor",
  ADMIN: "Administrator",
};

const linkClass =
  "inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-forest-900";

export default function AccountMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const staff = user.role !== "STUDENT";

  const accountLinks = staff ? (
    <>
      <Link
        href="/learn/author"
        className={linkClass}
        onClick={() => setOpen(false)}
      >
        <PenLine className="h-4 w-4" />
        Author
      </Link>
      {user.role === "ADMIN" && (
        <Link
          href="/learn/review"
          className={linkClass}
          onClick={() => setOpen(false)}
        >
          <ShieldCheck className="h-4 w-4" />
          Review
        </Link>
      )}
    </>
  ) : (
    <Link
      href="/learn/account"
      className={linkClass}
      onClick={() => setOpen(false)}
    >
      <CircleUserRound className="h-4 w-4" />
      My Progress
    </Link>
  );

  return (
    <div className="relative" ref={menuRef}>
      {/* Desktop — inline account area */}
      <div className="hidden items-center gap-4 sm:flex">
        <div className="text-right leading-tight">
          <p className="text-sm font-bold text-forest-900">{user.name}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
            {ROLE_LABELS[user.role]}
          </p>
        </div>
        <span className="h-6 w-px bg-forest-100" />
        {accountLinks}
        <form action={signout}>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </form>
      </div>

      {/* Mobile — hamburger + dropdown */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close account menu" : "Open account menu"}
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-forest-200 text-ink-soft transition-colors hover:border-gold-400 hover:text-gold-700 sm:hidden"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-forest-100 bg-white p-2 shadow-xl animate-scale-in sm:hidden">
          <div className="border-b border-forest-50 px-3 pb-2.5 pt-1.5">
            <p className="truncate text-sm font-bold text-forest-900">
              {user.name}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
          <div className="flex flex-col pt-1.5">
            <div className="flex flex-col">{accountLinks}</div>
            <form action={signout} className="pt-1.5">
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
