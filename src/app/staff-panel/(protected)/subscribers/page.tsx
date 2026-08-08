import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { AdminPageHeader, DataTable } from "@/components/admin/ui";
import DeleteButton from "@/components/admin/DeleteButton";
import SubscriberExport from "@/components/admin/SubscriberExport";
import { deleteSubscriber } from "@/app/staff-panel/actions";

export const metadata = { title: "Subscribers — Admin" };

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Newsletter Subscribers"
        description={`${subscribers.length} subscriber(s) signed up for the newsletter.`}
        action={<SubscriberExport subscribers={subscribers} />}
      />

      <DataTable
        rows={subscribers}
        getKey={(subscriber) => subscriber.id}
        emptyMessage="No subscribers yet. Subscriptions from the homepage newsletter form will appear here."
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
