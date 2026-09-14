import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, PAGE_SIZE, SecondaryLink } from "@/components/admin/ui";
import { QueryToast } from "@/components/admin/QueryToast";
import { ExecutiveList } from "@/components/admin/student-leadership/ExecutiveList";

const TOASTS = {
  "exec-required": "Name and position are required.",
  "exec-created": "Executive added.",
  "exec-updated": "Executive updated.",
  "exec-deleted": "Executive deleted.",
  "year-not-found": "Tenure not found.",
};

export default async function AdminTenurePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const year = await prisma.academicYear.findUnique({
    where: { id },
    select: { id: true, year: true, active: true },
  });
  if (!year) notFound();

  const [executives, total] = await Promise.all([
    prisma.studentExecutive.findMany({
      where: { academicYearId: year.id },
      orderBy: [{ ordering: "asc" }, { name: "asc" }],
      select: { id: true, name: true, position: true, photoUrl: true, ordering: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.studentExecutive.count({ where: { academicYearId: year.id } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  return (
    <div className="space-y-6">
      <QueryToast param="toast" messages={TOASTS} />
      <AdminPageHeader
        title={year.year}
        description={year.active ? "Current tenure" : "Past tenure"}
        action={
          <SecondaryLink href="/staff-panel/student-leadership">Back</SecondaryLink>
        }
      />
      <ExecutiveList
        yearId={year.id}
        yearLabel={year.year}
        executives={executives}
        total={total}
        pagination={{
          page: safePage,
          totalPages,
          basePath: `/staff-panel/student-leadership/${year.id}`,
        }}
      />
    </div>
  );
}
