"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChartBar,
  EnvelopeSimple,
  FolderOpen,
  Gear,
  GraduationCap,
  ImageSquare,
  List,
  Newspaper,
  SignOut,
  SquaresFour,
  Tray,
  Users,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/staff-panel/actions";
import type { SessionUser } from "@/lib/auth";

const sections: Array<{
  label: string;
  items: Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string; weight?: "duotone" }>; adminOnly?: boolean }>;
}> = [
  {
    label: "Overview",
    items: [{ href: "/staff-panel", label: "Dashboard", icon: SquaresFour }],
  },
  {
    label: "Content",
    items: [
      { href: "/staff-panel/news", label: "News & Events", icon: Newspaper },
      { href: "/staff-panel/projects", label: "Project Works", icon: FolderOpen },
      { href: "/staff-panel/lecturers", label: "Lecturers", icon: GraduationCap },
      { href: "/staff-panel/research", label: "Research Areas", icon: ChartBar },
      { href: "/staff-panel/programs", label: "Programmes", icon: BookOpen },
      { href: "/staff-panel/gallery", label: "Gallery", icon: ImageSquare },
    ],
  },
  {
    label: "Engagement",
    items: [
      { href: "/staff-panel/messages", label: "Messages", icon: Tray },
      { href: "/staff-panel/subscribers", label: "Subscribers", icon: EnvelopeSimple },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/staff-panel/users", label: "Users", icon: Users, adminOnly: true },
      { href: "/staff-panel/settings", label: "Site Settings", icon: Gear },
    ],
  },
];

export default function AdminSidebar({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/staff-panel" ? pathname === "/staff-panel" : pathname.startsWith(href);

  const sidebar = (
    <div className="flex h-full flex-col bg-forest-950 text-forest-100">
      <div className="flex items-center gap-3 px-5 py-5">
        <Image
          src="/itds-logo.png"
          alt="ITDS Department Logo"
          width={40}
          height={40}
          className="h-10 w-10 rounded-lg bg-white object-cover"
        />
        <div className="leading-tight">
          <p className="font-display text-base font-bold text-white">ITDS Admin</p>
          <p className="text-[11px] uppercase tracking-wider text-forest-300">
            Content Management
          </p>
        </div>
      </div>

      <nav className="scrollbar-hide flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-forest-400">
              {section.label}
            </p>
            <ul className="space-y-1">
              {section.items
                .filter((item) => !item.adminOnly || user.role === "ADMIN")
                .map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-gold-500 text-white"
                          : "text-forest-200 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <item.icon weight="duotone" className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-800 font-display text-sm font-bold text-gold-300">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-[11px] text-forest-300">
              {user.email} · {user.role}
            </p>
          </div>
        </div>
        <form action={logout} className="mt-3">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-forest-100 transition-colors hover:bg-red-500/20 hover:text-red-200"
          >
            <SignOut weight="duotone" className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 lg:block">{sidebar}</aside>

      {/* Mobile */}
      <div className="lg:hidden">
        <button
          aria-label="Toggle admin menu"
          onClick={() => setOpen(true)}
          className="fixed left-4 top-4 z-50 rounded-lg bg-forest-950 p-2.5 text-white"
        >
          {open ? <X weight="duotone" className="h-5 w-5" /> : <List weight="duotone" className="h-5 w-5" />}
        </button>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-forest-950/50" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-72">{sidebar}</aside>
          </div>
        )}
      </div>
    </>
  );
}
