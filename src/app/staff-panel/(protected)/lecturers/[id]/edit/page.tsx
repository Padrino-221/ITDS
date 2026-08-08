import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LecturerForm } from "@/components/admin/forms";
import { AdminPageHeader } from "@/components/admin/ui";

export default async function EditLecturerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lecturer = await prisma.lecturer.findUnique({ where: { id } });
  if (!lecturer) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Edit Lecturer" description={lecturer.name} />
      <LecturerForm lecturer={lecturer} />
    </div>
  );
}
