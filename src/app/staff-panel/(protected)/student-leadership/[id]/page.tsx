import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader, SecondaryLink } from "@/components/admin/ui";
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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const year = await prisma.academicYear.findUnique({
    where: { id },
    include: {
      executives: {
        orderBy: [{ ordering: "asc" }, { name: "asc" }],
        select: { id: true, name: true, position: true, photoUrl: true, ordering: true },
      },
    },
  });
  if (!year) notFound();

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
      <ExecutiveList yearId={year.id} yearLabel={year.year} executives={year.executives} />
    </div>
  );
}
