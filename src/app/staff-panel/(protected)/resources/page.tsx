import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/ui";
import { QueryToast } from "@/components/admin/QueryToast";
import { ResourceList } from "@/components/admin/resources/ResourceList";

export default async function AdminResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ toast?: string }>;
}) {
  const { toast } = await searchParams;
  const [resources, academicYears] = await Promise.all([
    prisma.resource.findMany({
      include: { academicYear: { select: { year: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.academicYear.findMany({ orderBy: { year: "desc" } }),
  ]);

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
      <ResourceList resources={resources} academicYears={academicYears} />
    </div>
  );
}
