import { prisma } from "@/lib/prisma";
import { AdminPageHeader, PAGE_SIZE } from "@/components/admin/ui";
import { QueryToast } from "@/components/admin/QueryToast";
import { ResourceList } from "@/components/admin/resources/ResourceList";

export default async function AdminResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ toast?: string; page?: string }>;
}) {
  const { toast, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const [resources, total, academicYears] = await Promise.all([
    prisma.resource.findMany({
      include: { academicYear: { select: { year: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.resource.count(),
    prisma.academicYear.findMany({ orderBy: { year: "desc" } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  return (
    <div className="space-y-6">
      <QueryToast
        param="toast"
        messages={{
          "resource-required": "Title and file are required.",
          "resource-created": "Resource created.",
          "resource-updated": "Resource updated.",
          "year-not-found": "Academic year not found.",
        }}
      />
      <AdminPageHeader title="Resources" description="Handbooks, student lists and other documents for Academics → Resources." />
      <ResourceList
        resources={resources}
        academicYears={academicYears}
        total={total}
        pagination={{ page: safePage, totalPages, basePath: "/staff-panel/resources" }}
      />
    </div>
  );
}
