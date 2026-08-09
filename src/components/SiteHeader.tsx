"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BadgeCheck, ChevronDown, Menu, X } from "lucide-react";
import { cn, LEARN_URL } from "@/lib/utils";

type NavChild = { label: string; href: string };
type NavItem = { label: string; href?: string; children?: NavChild[] };

const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    children: [
      { label: "About Us", href: "/about" },
      { label: "IT Society", href: "/about/it-society" },
    ],
  },
  { label: "News & Events", href: "/news" },
  { label: "Research", href: "/research" },
  {
    label: "Programmes",
    children: [
      { label: "All Programmes", href: "/programs" },
      { label: "Undergraduate", href: "/programs/undergraduate" },
      { label: "Diploma", href: "/programs/diploma" },
      { label: "MSc", href: "/programs/msc" },
      { label: "MPhil", href: "/programs/mphil" },
      { label: "PhD", href: "/programs/phd" },
    ],
  },
  { label: "Lecturers", href: "/lecturers" },
  { label: "E-Learning", href: LEARN_URL },
];

export default function SiteHeader({
  announcement,
}: {
  announcement: string;
}) {
  const [open, setOpen] = useState(false);
  const [mobileChildren, setMobileChildren] = useState<Record<string, boolean>>({});
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleChild = (label: string) =>
    setMobileChildren((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-gold-500 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-xs font-semibold sm:px-6 lg:px-8">
          <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{announcement || "Welcome to the ITDS Department — University of Energy and Natural Resources"}</span>
        </div>
      </div>

      {/* Main header */}
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-all duration-300",
          scrolled
            ? "border-forest-100 bg-white/95 backdrop-blur-md shadow-lg shadow-forest-950/5"
            : "border-transparent bg-white"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <Image
              src="/logo-512.jpg"
              alt="ITDS Department Logo"
              width={48}
              height={48}
              priority
              className="h-11 w-11 rounded-xl object-cover md:h-12 md:w-12"
            />
            <span className="min-w-0 leading-tight">
              <span className="block font-display text-lg font-extrabold uppercase tracking-tight text-forest-950 sm:text-xl">
                ITDS <span className="text-gold-500">·</span> UENR
              </span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft sm:block">
                Info Tech &amp; Decision Sciences
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) =>
              item.children ? (
                <div key={item.label} className="group relative">
                  <button className="flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-forest-50 hover:text-forest-800">
                    {item.label}
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="invisible absolute left-0 top-full z-50 w-56 translate-y-1 rounded-xl border border-forest-100 bg-white p-1.5 opacity-0 shadow-xl shadow-forest-950/10 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-gold-50 hover:text-gold-700"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href!}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                    pathname === item.href
                      ? "bg-forest-950 text-white"
                      : "text-ink hover:bg-forest-50 hover:text-forest-800"
                  )}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-gold-600 hover:shadow-lg hover:shadow-gold-500/25"
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-mobile-menu"
            className="rounded-lg border border-forest-200 p-2 text-forest-950 lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div id="site-mobile-menu" className="border-t border-forest-100 bg-white lg:hidden">
            <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
              {NAV.map((item) =>
                item.children ? (
                  <div key={item.label}>
                    <button
                      onClick={() => toggleChild(item.label)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-ink hover:bg-forest-50"
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          mobileChildren[item.label] && "rotate-180"
                        )}
                      />
                    </button>
                    {mobileChildren[item.label] && (
                      <div className="ml-3 border-l-2 border-forest-100 pl-3">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className="block rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-gold-50 hover:text-gold-700"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href!}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-lg px-3 py-2.5 text-sm font-semibold",
                      pathname === item.href
                        ? "bg-forest-950 text-white"
                        : "text-ink hover:bg-forest-50"
                    )}
                  >
                    {item.label}
                  </Link>
                )
              )}
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mt-2 block w-full rounded-lg bg-gold-500 px-4 py-3 text-center text-sm font-bold text-white"
              >
                Contact Us
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
