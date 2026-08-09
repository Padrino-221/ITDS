import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { AdminPageHeader, DataTable, PAGE_SIZE } from "@/components/admin/ui";
import DeleteButton from "@/components/admin/DeleteButton";
import SubscriberExport from "@/components/admin/SubscriberExport";
import { deleteSubscriber } from "@/app/staff-panel/actions";

export const metadata = { title: "Subscribers — Admin" };

export default async function AdminSubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const [subscribers, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      select: { id: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.newsletterSubscriber.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Newsletter Subscribers"
        description={`${total} subscriber(s) signed up for the newsletter.`}
        action={<SubscriberExport subscribers={subscribers} />}
      />

      <DataTable
        rows={subscribers}
        getKey={(subscriber) => subscriber.id}
        emptyMessage="No subscribers yet. Subscriptions from the homepage newsletter form will appear here."
        pagination={{ page: safePage, totalPages, basePath: "/staff-panel/subscribers" }}
        columns={[
          {
            key: "email",
            header: "Email",
            cell: (subscriber) => (
              <span className="font-semibold text-forest-900">{subscriber.email}</span>
            ),
          },
          {
            key: "created",
            header: "Subscribed",
            cell: (subscriber) => (
              <span className="text-ink-soft">{formatDate(subscriber.createdAt)}</span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            align: "right",
            cell: (subscriber) => (
              <div className="flex justify-end">
                <DeleteButton
                  action={deleteSubscriber.bind(null, subscriber.id)}
                  confirmText={`Remove ${subscriber.email} from the newsletter list?`}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
