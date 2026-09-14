import { prisma } from "@/lib/prisma";
import { AdminCard, AdminPageHeader, PAGE_SIZE } from "@/components/admin/ui";
import { QueryToast } from "@/components/admin/QueryToast";
import { TenureForm } from "@/components/admin/student-leadership/TenureForm";
import { TenureList } from "@/components/admin/student-leadership/TenureList";

const TOASTS = {
  "year-required": "A year is required.",
  "year-exists": "That academic year already exists.",
  "year-created": "Tenure created.",
  "year-updated": "Tenure updated.",
  "year-current": "Current tenure updated.",
  "year-deleted": "Tenure deleted.",
  "year-not-found": "Tenure not found.",
  "exec-deleted": "Executive deleted.",
};

export default async function AdminStudentLeadershipPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [tenures, total] = await Promise.all([
    prisma.academicYear.findMany({
      orderBy: { year: "desc" },
      include: { _count: { select: { executives: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.academicYear.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  return (
    <div className="space-y-6">
      <QueryToast param="toast" messages={TOASTS} />
      <AdminPageHeader
        title="Student Leadership"
        description="Manage the IT Society executive tenures (academic years) and the executives in each."
      />

      <AdminCard title="Add Tenure">
        <TenureForm />
      </AdminCard>

      <TenureList
        tenures={tenures.map((t) => ({
          id: t.id,
          year: t.year,
          active: t.active,
          executiveCount: t._count.executives,
        }))}
        pagination={{
          page: safePage,
          totalPages,
          basePath: "/staff-panel/student-leadership",
        }}
      />
    </div>
  );
}
