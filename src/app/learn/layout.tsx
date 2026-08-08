import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, CircleUserRound, LogOut, PenLine, ShieldCheck } from "lucide-react";
import { getSubjects } from "@/lib/learn";
import { getSession } from "@/lib/auth";
import type { SessionRole } from "@/lib/auth";
import { signout } from "./actions";

const ROLE_LABELS: Record<SessionRole, string> = {
  STUDENT: "Learner",
  LECTURER: "Lecturer",
  EDITOR: "Editor",
  ADMIN: "Administrator",
};

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const [subjects, session] = await Promise.all([getSubjects(), getSession()]);

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      {/* Learn header — the e-learning app has its own chrome */}
      <header className="sticky top-0 z-50 border-b border-forest-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/learn" className="flex items-center gap-2.5">
              <Image
                src="/logo-512.jpg"
                alt="ITDS Department Logo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-lg object-cover"
              />
              <span className="leading-tight">
                <span className="block font-display text-sm font-extrabold uppercase tracking-tight text-forest-950 sm:text-base">
                  ITDS <span className="text-gold-500">·</span> E-Learning
                </span>
                <span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft sm:block">
                  Department of IT &amp; Decision Sciences · UENR
                </span>
              </span>
            </Link>

            <div className="ml-auto flex items-center gap-4">
              {session ? (
                <>
                  {/* Always show WHO is signed in, so the menu is never a mystery */}
                  <div className="hidden text-right leading-tight sm:block">
                    <p className="text-sm font-bold text-forest-900">{session.name}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                      {ROLE_LABELS[session.role]}
                    </p>
                  </div>
                  <span className="hidden h-6 w-px bg-forest-100 sm:block" />
                  {session.role === "STUDENT" ? (
                    <Link
                      href="/learn/account"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-forest-900"
                    >
                      <CircleUserRound className="h-4 w-4" />
                      My Progress
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/learn/author"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-forest-900"
                      >
                        <PenLine className="h-4 w-4" />
                        Author
                      </Link>
                      {session.role === "ADMIN" && (
                        <Link
                          href="/learn/review"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-forest-900"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Review
                        </Link>
                      )}
                    </>
                  )}
                  <form action={signout}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/learn/account/signin"
                  className="rounded-lg bg-forest-950 px-4 py-2 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>

          {/* Subject row — single line, scrolls horizontally on small screens */}
          <nav className="scrollbar-hide -mx-1 mt-3 flex items-center gap-x-5 overflow-x-auto border-t border-forest-50 px-1 pt-3 text-sm">
            <Link
              href="/learn"
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-bold text-forest-950 transition-colors hover:text-gold-600"
            >
              <BookOpen className="h-4 w-4 text-gold-500" />
              Home
            </Link>
            {subjects.map((s) => (
              <Link
                key={s.id}
                href={`/learn/${s.slug}`}
                className="shrink-0 whitespace-nowrap font-semibold text-ink-soft transition-colors hover:text-forest-900"
              >
                {s.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Slim learn footer */}
      <footer className="border-t border-forest-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-ink-soft sm:flex-row sm:px-6 lg:px-8">
          <p>
            ITDS E-Learning · Department of Information Technology &amp; Decision
            Sciences, UENR
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-bold text-gold-600 transition-colors hover:text-gold-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to main website
          </Link>
        </div>
      </footer>
    </div>
  );
}
