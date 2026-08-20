import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSpmsAuth } from "@/lib/spms-auth";
import { DEGREE_LABELS } from "@/lib/data";
import {
  AdminPageHeader,
  DataTable,
  PAGE_SIZE,
  PrimaryLink,
  SecondaryLink,
} from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { Pencil, Download } from "lucide-react";
import DeleteConfirm from "@/components/spms/DeleteConfirm";
import ProjectsFilter from "@/components/spms/ProjectsFilter";

export const metadata = { title: "Projects" };

export default async function SpmsProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    year?: string;
    area?: string;
    degree?: string;
    created?: string;
    updated?: string;
  }>;
}) {
  const user = await requireSpmsAuth();
  const isAdmin = user.role === "ADMIN";
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  // Build where clause — lecturers see only their linked projects
  const where: any = {};
  let lecturerId: string | null = null;
  if (!isAdmin) {
    const supervisor = await prisma.supervisor.findUnique({
      where: { id: user.id },
      select: { lecturerId: true },
    });
    lecturerId = supervisor?.lecturerId ?? null;
    where.supervisorId = lecturerId ?? "__none__";
  }
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { studentName: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params.year) where.academicYear = params.year;
  if (params.degree) where.degreeLevel = params.degree;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      select: {
        id: true,
        title: true,
        degreeLevel: true,
        academicYear: true,
        studentName: true,
        documentUrl: true,
        documentName: true,
        createdAt: true,
        supervisor: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.project.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Get unique academic years for filter
  const academicYears = await prisma.project.findMany({
    select: { academicYear: true },
    distinct: ["academicYear"],
    where: isAdmin ? {} : { supervisorId: lecturerId ?? "__none__" },
    orderBy: { academicYear: "desc" },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={isAdmin ? "All Projects" : "My Projects"}
        description={`${total} project${total !== 1 ? "s" : ""} total`}
        action={
          <PrimaryLink href="/spms/projects/new">
            + New Project
          </PrimaryLink>
        }
      />

      <SavedToast saved={params.created} message="Project created successfully!" />
      <SavedToast saved={params.updated} message="Project updated successfully!" />

      {/* Filters */}
      <ProjectsFilter
        academicYears={academicYears}
        initialSearch={params.search ?? ""}
        initialYear={params.year ?? ""}
        initialDegree={params.degree ?? ""}
      />

      {/* Projects table */}
      <DataTable
        rows={projects}
        getKey={(project) => project.id}
        emptyMessage="No projects found."
        pagination={{
          page,
          totalPages,
          basePath: `/spms/projects${params.search ? `?search=${params.search}` : ""}${params.year ? `${params.search ? "&" : "?"}year=${params.year}` : ""}${params.degree ? `${params.search || params.year ? "&" : "?"}degree=${params.degree}` : ""}`,
        }}
        columns={[

          {
            key: "title",
            header: "Title",
            className: "max-w-xs",
            cell: (project) => (
              <span className="line-clamp-1 font-medium text-forest-900">
                {project.title}
              </span>
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
            key: "year",
            header: "Year",
            cell: (project) => project.academicYear ?? "—",
          },
          ...(isAdmin
            ? [
                {
                  key: "supervisor",
                  header: "Supervisor",
                  cell: (project: any) => project.supervisor?.name ?? "—",
                },
              ]
            : []),
          {
            key: "actions",
            header: "Actions",
            align: "right" as const,
            cell: (project) => (
              <div className="flex justify-end gap-2">
                <SecondaryLink
                  href={`/spms/projects/${project.id}/edit`}
                  size="sm"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </SecondaryLink>
                {project.documentUrl && (
                  <SecondaryLink
                    href={project.documentUrl}
                    size="sm"
                  >
                    <Download className="h-3 w-3" />
                    PDF
                  </SecondaryLink>
                )}
                <DeleteConfirm projectId={project.id} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
