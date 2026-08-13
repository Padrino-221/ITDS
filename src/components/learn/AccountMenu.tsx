"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleUserRound,
  ListTree,
  LogOut,
  Menu,
  PenLine,
  ShieldCheck,
  X,
} from "lucide-react";
import type { LearnerSession } from "@/lib/learn-auth";
import type { SessionRole, SessionUser } from "@/lib/auth";
import { signout, staffSignout } from "@/app/learn/actions";
import { learnUrl } from "@/lib/utils";

const ROLE_LABELS: Record<SessionRole, string> = {
  LECTURER: "Lecturer",
  EDITOR: "Editor",
  ADMIN: "Administrator",
};

const linkClass =
  "inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-forest-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40 rounded";

/**
 * Header account area. Fetches the learner and staff sessions client-side
 * through the learn API so the /learn layout stays static (no server-side
 * cookie/JWT work on every request). Shows a compact Sign in link when
 * anonymous, the learner account menu when signed in as a learner, and the
 * staff menu (Author/Review links) when signed in as staff. The inline menu
 * shows on desktop; small screens get a hamburger + dropdown.
 */
export default function AccountMenu() {
  const [learner, setLearner] = useState<LearnerSession | null>(null);
  const [staff, setStaff] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;
    Promise.all([
      fetch("/api/learn/session", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/staff/session", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([learnerData, staffData]) => {
        if (cancelled) return;
        setLearner((learnerData?.user as LearnerSession) ?? null);
        setStaff((staffData?.user as SessionUser) ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setLearner(null);
        setStaff(null);
      })
      .finally(() => {
        if (cancelled) return;
        if (mountedRef.current) setLoading(false);
      });
    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, [pathname]);

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

  if (loading && !learner && !staff) {
    return <span aria-hidden className="h-10 w-20 animate-pulse rounded-lg bg-forest-100" />;
  }

  if (!learner && !staff) {
    return (
      <Link
        href={learnUrl("/account/signin")}
        className="rounded-lg bg-forest-950 px-4 py-2 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
      >
        Sign in
      </Link>
    );
  }

  if (learner) {
    return (
      <AccountArea
        menuRef={menuRef}
        open={open}
        setOpen={setOpen}
        label="Learner"
        name={learner.name}
        signoutAction={signout}
      >
        <Link
          href={learnUrl("/account")}
          className={linkClass}
          onClick={() => setOpen(false)}
        >
          <CircleUserRound className="h-4 w-4" />
          My Progress
        </Link>
      </AccountArea>
    );
  }

  const user = staff as SessionUser;
  return (
    <AccountArea
      menuRef={menuRef}
      open={open}
      setOpen={setOpen}
      label={ROLE_LABELS[user.role]}
      name={user.name}
      signoutAction={staffSignout}
    >
      {user.role !== "EDITOR" && (
        <Link href={learnUrl("/author")} className={linkClass} onClick={() => setOpen(false)}>
          <PenLine className="h-4 w-4" />
          Author
        </Link>
      )}
      {user.role === "ADMIN" && (
        <>
          <Link href={learnUrl("/manage")} className={linkClass} onClick={() => setOpen(false)}>
            <ListTree className="h-4 w-4" />
            Manage
          </Link>
          <Link href={learnUrl("/review")} className={linkClass} onClick={() => setOpen(false)}>
            <ShieldCheck className="h-4 w-4" />
            Review
          </Link>
        </>
      )}
    </AccountArea>
  );
}

function AccountArea({
  menuRef,
  open,
  setOpen,
  label,
  name,
  signoutAction,
  children,
}: {
  menuRef: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  label: string;
  name: string;
  signoutAction: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative" ref={menuRef}>
      {/* Desktop — inline account area */}
      <div className="hidden items-center gap-4 sm:flex">
        <div className="text-right leading-tight">
          <p className="text-sm font-bold text-forest-900">{name}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
            {label}
          </p>
        </div>
        <span className="h-6 w-px bg-forest-100" />
        {children}
        <form action={signoutAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
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
        aria-haspopup="menu"
        aria-controls={open ? "learn-account-menu" : undefined}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-forest-200 text-ink-soft transition-colors hover:border-gold-400 hover:text-gold-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 sm:hidden"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div
          id="learn-account-menu"
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-forest-100 bg-white p-2 shadow-xl animate-scale-in sm:hidden"
        >
          <div className="border-b border-forest-50 px-3 pb-2.5 pt-1.5">
            <p className="truncate text-sm font-bold text-forest-900">{name}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
              {label}
            </p>
          </div>
          <div className="flex flex-col pt-1.5">
            <div className="flex flex-col">{children}</div>
            <form action={signoutAction} className="pt-1.5">
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
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