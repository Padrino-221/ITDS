import Link from "next/link";
import { BookOpen, CircleUserRound, LogOut, PenLine, ShieldCheck } from "lucide-react";
import { getSubjects } from "@/lib/learn";
import { getSession } from "@/lib/auth";
import { signout } from "./actions";
import { cn } from "@/lib/utils";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const [subjects, session] = await Promise.all([getSubjects(), getSession()]);

  return (
    <div className="min-h-full bg-paper">
      <nav className="border-b border-forest-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link
              href="/learn"
              className="flex items-center gap-2 font-display text-base font-extrabold uppercase tracking-tight text-forest-950"
            >
              <BookOpen className="h-4 w-4 text-gold-500" />
              Learn
            </Link>
            <span className="hidden h-4 w-px bg-forest-100 sm:block" />
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {subjects.map((s) => (
                <Link
                  key={s.id}
                  href={`/learn/${s.slug}`}
                  className="font-semibold text-ink-soft transition-colors hover:text-forest-900"
                >
                  {s.name}
                </Link>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-4">
              {session ? (
                <>
                  <Link
                    href="/learn/account"
                    className={cn(
                      "inline-flex items-center gap-1.5 font-semibold transition-colors",
                      "text-ink-soft hover:text-forest-900"
                    )}
                  >
                    <CircleUserRound className="h-4 w-4" />
                    My Progress
                  </Link>
                  {session.role !== "STUDENT" && (
                    <Link
                      href="/learn/author"
                      className="inline-flex items-center gap-1.5 font-semibold text-ink-soft transition-colors hover:text-forest-900"
                    >
                      <PenLine className="h-4 w-4" />
                      Author
                    </Link>
                  )}
                  {session.role === "ADMIN" && (
                    <Link
                      href="/learn/review"
                      className="inline-flex items-center gap-1.5 font-semibold text-ink-soft transition-colors hover:text-forest-900"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Review
                    </Link>
                  )}
                  <form action={signout}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 px-3 py-1.5 font-semibold text-ink-soft transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
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
        </div>
      </nav>
      {children}
    </div>
  );
}
