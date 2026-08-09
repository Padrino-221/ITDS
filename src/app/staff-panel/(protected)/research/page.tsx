import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  AdminPageHeader,
  DataTable,
  PAGE_SIZE,
  PrimaryLink,
  SecondaryLink,
} from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteResearchArea } from "@/app/staff-panel/actions";

export default async function AdminResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; page?: string }>;
}) {
  const { saved, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const [areas, total] = await Promise.all([
    prisma.researchArea.findMany({
      select: { id: true, title: true, description: true, order: true },
      orderBy: { order: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.researchArea.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Research Areas"
        description="Manage the department's research domains."
        action={
          <PrimaryLink href="/staff-panel/research/new">
            <Plus className="h-4 w-4" />
            New Area
          </PrimaryLink>
        }
      />
      <SavedToast saved={saved} />

      <DataTable
        rows={areas}
        getKey={(area) => area.id}
        emptyMessage="No research areas yet. Create your first one."
        pagination={{ page: safePage, totalPages, basePath: "/staff-panel/research" }}
        columns={[
          {
            key: "title",
            header: "Title",
            className: "max-w-md",
            cell: (area) => (
              <div>
                <Link
                  href={`/staff-panel/research/${area.id}/edit`}
                  className="font-semibold text-forest-900 hover:text-forest-700"
                >
                  {area.title}
                </Link>
                <p className="line-clamp-1 text-xs text-ink-soft">{area.description}</p>
              </div>
            ),
          },
          {
            key: "order",
            header: "Order",
            cell: (area) => <span className="text-ink-soft">{area.order}</span>,
          },
          {
            key: "actions",
            header: "Actions",
            align: "right",
            cell: (area) => (
              <div className="flex justify-end gap-2">
                <SecondaryLink href={`/staff-panel/research/${area.id}/edit`} size="sm">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </SecondaryLink>
                <DeleteButton action={deleteResearchArea.bind(null, area.id)} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
