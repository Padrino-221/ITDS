import Link from "next/link";
import {
  Newspaper,
  Plus,
  Target,
  Inbox,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { AdminCard, AdminPageHeader, PrimaryLink, SecondaryLink } from "@/components/admin/ui";

export default async function AdminDashboard() {
  const [
    newsCount,
    researchCount,
    unreadMessages,
    recentMessages,
  ] = await Promise.all([
    prisma.newsPost.count(),
    prisma.researchArea.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const cards = [
    { label: "News & Events", value: newsCount, icon: Newspaper, href: "/staff-panel/news" },
    { label: "Research Areas", value: researchCount, icon: Target, href: "/staff-panel/research" },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Overview of your content and recent activity."
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-xl border border-forest-100 bg-white p-5 transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-700 transition-colors group-hover:bg-forest-800 group-hover:text-gold-300">
                <card.icon className="h-5 w-5" />
              </span>
              <span className="font-display text-3xl font-bold text-forest-900">
                {card.value}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-ink-soft">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent messages */}
        <AdminCard
          title={
            <>
              <Inbox className="h-5 w-5 text-gold-600" />
              Recent Messages
              {unreadMessages > 0 && (
                <span className="rounded-lg bg-gold-100 px-2 py-0.5 text-xs font-bold text-gold-700">
                  {unreadMessages} unread
                </span>
              )}
            </>
          }
          action={
            <Link href="/staff-panel/messages" className="text-sm font-semibold text-forest-700 hover:text-forest-900">
              View all →
            </Link>
          }
        >
          {recentMessages.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">No messages yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-forest-50">
              {recentMessages.map((message) => (
                <li key={message.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-forest-900">
                      {message.subject}
                    </p>
                    <p className="truncate text-xs text-ink-soft">
                      {message.name} · {formatDateTime(message.createdAt)}
                    </p>
                  </div>
                  {!message.read && (
                    <span className="h-2 w-2 shrink-0 rounded-lg bg-gold-500" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      {/* Quick actions */}
      <AdminCard title="Quick Actions" variant="dashed">
        <div className="mt-4 flex flex-wrap gap-3">
          <PrimaryLink href="/staff-panel/news/new">
            <Plus className="h-4 w-4" /> New post
          </PrimaryLink>
          <SecondaryLink href="/staff-panel/settings">Edit site settings</SecondaryLink>
        </div>
      </AdminCard>
    </div>
  );
}
