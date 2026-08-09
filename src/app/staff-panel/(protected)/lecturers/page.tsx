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
import { deleteLecturer } from "@/app/staff-panel/actions";

export default async function AdminLecturersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; page?: string }>;
}) {
  const { saved, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const [lecturers, total] = await Promise.all([
    prisma.lecturer.findMany({
      select: {
        id: true,
        name: true,
        title: true,
        _count: { select: { projects: true } },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.lecturer.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Lecturers"
        description="Manage faculty profiles."
        action={
          <PrimaryLink href="/staff-panel/lecturers/new">
            <Plus className="h-4 w-4" />
            New Lecturer
          </PrimaryLink>
        }
      />
      <SavedToast saved={saved} />

      <DataTable
        rows={lecturers}
        getKey={(lecturer) => lecturer.id}
        emptyMessage="No lecturers yet. Create your first one."
        pagination={{ page: safePage, totalPages, basePath: "/staff-panel/lecturers" }}
        columns={[
          {
            key: "name",
            header: "Name",
            cell: (lecturer) => (
              <Link
                href={`/staff-panel/lecturers/${lecturer.id}/edit`}
                className="font-semibold text-forest-900 hover:text-forest-700"
              >
                {lecturer.name}
              </Link>
            ),
          },
          {
            key: "title",
            header: "Title",
            cell: (lecturer) => <span className="text-ink-soft">{lecturer.title}</span>,
          },
          {
            key: "projects",
            header: "Projects",
            cell: (lecturer) => (
              <span className="text-ink-soft">{lecturer._count.projects} project(s)</span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            align: "right",
            cell: (lecturer) => (
              <div className="flex justify-end gap-2">
                <SecondaryLink href={`/staff-panel/lecturers/${lecturer.id}/edit`} size="sm">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </SecondaryLink>
                <DeleteButton action={deleteLecturer.bind(null, lecturer.id)} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
