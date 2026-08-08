import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/admin/forms";
import { AdminPageHeader } from "@/components/admin/ui";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();
  const lecturers = await prisma.lecturer.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Edit Project" description={project.title} />
      <ProjectForm project={project} lecturers={lecturers} />
    </div>
  );
}
