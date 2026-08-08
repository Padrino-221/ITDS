import { Mail, MailOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { AdminCard, AdminPageHeader, SecondaryButton } from "@/components/admin/ui";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteMessage, toggleMessageRead } from "@/app/staff-panel/actions";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Messages"
        description={
          unread > 0
            ? `You have ${unread} unread message(s) from the contact form.`
            : "All contact form messages."
        }
      />

      {messages.length === 0 ? (
        <AdminCard className="text-sm text-ink-soft">
          No messages yet. Messages sent from the contact page will appear here.
        </AdminCard>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-xl border bg-white p-6 ${
                message.read ? "border-forest-100" : "border-gold-300 ring-1 ring-gold-200"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-forest-900">
                    {message.subject}
                  </h2>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {message.name} ·{" "}
                    <a
                      href={`mailto:${message.email}`}
                      className="text-forest-700 hover:underline"
                    >
                      {message.email}
                    </a>{" "}
                    · {formatDateTime(message.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={toggleMessageRead.bind(null, message.id)}>
                    <SecondaryButton tone={message.read ? "default" : "gold"}>
                      {message.read ? (
                        <Mail className="h-3.5 w-3.5" />
                      ) : (
                        <MailOpen className="h-3.5 w-3.5" />
                      )}
                      {message.read ? "Mark unread" : "Mark read"}
                    </SecondaryButton>
                  </form>
                  <DeleteButton action={deleteMessage.bind(null, message.id)} label="Delete" />
                </div>
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                {message.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
