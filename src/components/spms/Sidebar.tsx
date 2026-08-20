"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FolderOpen,
  KeyRound,
  Plus,
  User,
  Users,
} from "lucide-react";
import {
  Gear,
  List,
  SignOut,
  SquaresFour,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { spmsLogout } from "@/app/spms/(protected)/actions";
import type { SpmsSessionUser } from "@/lib/spms-auth";

const lecturerItems = [
  { href: "/spms/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/spms/projects", label: "My Projects", icon: FolderOpen },
  { href: "/spms/projects/new", label: "Upload New Project", icon: Plus },
  { href: "/spms/profile", label: "My Profile", icon: User },
];

const adminItems = [
  { href: "/spms/users", label: "Users", icon: Users },
  { href: "/spms/settings", label: "Settings", icon: Gear },
];

export default function SpmsSidebar({ user }: { user: SpmsSessionUser }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const sidebar = (
    <div className="flex h-full flex-col bg-forest-950 text-forest-100">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <Image
          src="/itds-logo.png"
          alt="ITDS Department Logo"
          width={40}
          height={40}
          className="h-10 w-10 rounded-lg bg-white object-cover"
        />
        <div className="leading-tight">
          <p className="font-display text-base font-bold text-white">ITDS SPMS</p>
          <p className="text-[11px] uppercase tracking-wider text-forest-300">
            Project Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="scrollbar-hide flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {/* Main section */}
        <div>
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-forest-400">
            SPMS
          </p>
          <ul className="space-y-1">
            {lecturerItems.map((item) => (
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
                  {'weight' in item.icon ? <item.icon weight="duotone" className="h-4 w-4 shrink-0" /> : <item.icon className="h-4 w-4 shrink-0" />}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Admin section */}
        {user.role === "ADMIN" && (
          <div>
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-forest-400">
              Admin
            </p>
            <ul className="space-y-1">
              {adminItems.map((item) => (
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
                    {'weight' in item.icon ? <item.icon weight="duotone" className="h-4 w-4 shrink-0" /> : <item.icon className="h-4 w-4 shrink-0" />}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Extras section */}
        <div>
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-forest-400">
            Extras
          </p>
          <ul className="space-y-1">
            <li>
              <Link
                href="/spms/change-password"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive("/spms/change-password")
                    ? "bg-gold-500 text-white"
                    : "text-forest-200 hover:bg-white/5 hover:text-white"
                )}
              >
                <KeyRound className="h-4 w-4 shrink-0" />
                Change Password
              </Link>
            </li>
            <li>
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-forest-200 transition-colors hover:bg-white/5 hover:text-white"
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                Front End
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* User info + logout */}
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
        <form action={spmsLogout} className="mt-3">
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
          aria-label="Toggle SPMS menu"
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
