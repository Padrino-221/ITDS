import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import {
  AdminPageHeader,
  DataTable,
  PrimaryLink,
  SecondaryLink,
  StatusBadge,
} from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteNews } from "@/app/staff-panel/actions";

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const posts = await prisma.newsPost.findMany({
    select: { id: true, title: true, category: true, publishedAt: true, published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="News & Events"
        description="Manage posts shown on the News & Events page."
        action={
          <PrimaryLink href="/staff-panel/news/new">
            <Plus className="h-4 w-4" />
            New Post
          </PrimaryLink>
        }
      />
      <SavedToast saved={saved} />

      <DataTable
        rows={posts}
        getKey={(post) => post.id}
        emptyMessage="No posts yet. Create your first one."
        columns={[
          {
            key: "title",
            header: "Title",
            className: "max-w-xs",
            cell: (post) => (
              <Link
                href={`/staff-panel/news/${post.id}/edit`}
                className="line-clamp-1 font-semibold text-forest-900 hover:text-forest-700"
              >
                {post.title}
              </Link>
            ),
          },
          {
            key: "category",
            header: "Category",
            cell: (post) => (
              <span className="rounded-lg bg-gold-50 px-2.5 py-1 text-xs font-medium text-gold-800">
                {post.category}
              </span>
            ),
          },
          {
            key: "date",
            header: "Date",
            cell: (post) => <span className="text-ink-soft">{formatDate(post.publishedAt)}</span>,
          },
          {
            key: "status",
            header: "Status",
            cell: (post) => <StatusBadge active={post.published} />,
          },
          {
            key: "actions",
            header: "Actions",
            align: "right",
            cell: (post) => (
              <div className="flex justify-end gap-2">
                <SecondaryLink href={`/staff-panel/news/${post.id}/edit`} size="sm">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </SecondaryLink>
                <DeleteButton action={deleteNews.bind(null, post.id)} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
