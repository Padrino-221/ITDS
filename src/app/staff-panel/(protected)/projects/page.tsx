import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DEGREE_LABELS } from "@/lib/data";
import {
  AdminPageHeader,
  DataTable,
  PrimaryLink,
  SecondaryLink,
  StatusBadge,
} from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteProject } from "@/app/staff-panel/actions";

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const projects = await prisma.project.findMany({
    include: { supervisor: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Project Works"
        description="Manage the SPMS project repository."
        action={
          <PrimaryLink href="/staff-panel/projects/new">
            <Plus className="h-4 w-4" />
            New Project
          </PrimaryLink>
        }
      />
      <SavedToast saved={saved} />

      <DataTable
        rows={projects}
        getKey={(project) => project.id}
        emptyMessage="No projects yet. Create your first one."
        columns={[
          {
            key: "title",
            header: "Title",
            className: "max-w-xs",
            cell: (project) => (
              <Link
                href={`/staff-panel/projects/${project.id}/edit`}
                className="line-clamp-1 font-semibold text-forest-900 hover:text-forest-700"
              >
                {project.title}
              </Link>
            ),
          },
          {
            key: "degree",
            header: "Degree",
            cell: (project) => (
              <span className="rounded-lg bg-gold-50 px-2.5 py-1 text-xs font-medium text-gold-800">
                {DEGREE_LABELS[project.degreeLevel]}
              </span>
            ),
          },
          {
            key: "student",
            header: "Student",
            cell: (project) => <span className="text-ink-soft">{project.studentName ?? "—"}</span>,
          },
          {
            key: "supervisor",
            header: "Supervisor",
            cell: (project) => (
              <span className="text-ink-soft">{project.supervisor?.name ?? "—"}</span>
            ),
          },
          {
            key: "status",
            header: "Status",
            cell: (project) => <StatusBadge active={project.published} />,
          },
          {
            key: "actions",
            header: "Actions",
            align: "right",
            cell: (project) => (
              <div className="flex justify-end gap-2">
                <SecondaryLink href={`/staff-panel/projects/${project.id}/edit`} size="sm">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </SecondaryLink>
                <DeleteButton action={deleteProject.bind(null, project.id)} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
