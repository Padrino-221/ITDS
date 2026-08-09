import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen } from "lucide-react";
import { getSubjects } from "@/lib/learn";
import { SITE_URL } from "@/lib/utils";
import AccountMenu from "@/components/learn/AccountMenu";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const subjects = await getSubjects();

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      {/* Learn header — the e-learning app has its own chrome */}
      <header className="sticky top-0 z-50 border-b border-forest-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/" className="flex items-center gap-2.5">
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

            <div className="ml-auto flex items-center">
              {/* Session is fetched client-side so this layout stays static */}
              <AccountMenu />
            </div>
          </div>

          {/* Subject row — single line, scrolls horizontally on small screens */}
          <nav className="scrollbar-hide -mx-1 mt-3 flex items-center gap-x-5 overflow-x-auto border-t border-forest-50 px-1 pt-3 text-sm">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-bold text-forest-950 transition-colors hover:text-gold-600"
            >
              <BookOpen className="h-4 w-4 text-gold-500" />
              Home
            </Link>
            {subjects.map((s) => (
              <Link
                key={s.id}
                href={`/${s.slug}`}
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
            href={SITE_URL}
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
