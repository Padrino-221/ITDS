import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/admin/forms";
import { AdminPageHeader } from "@/components/admin/ui";

export default async function NewProjectPage() {
  const lecturers = await prisma.lecturer.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-6">
      <AdminPageHeader title="New Project" description="Add a project to the repository." />
      <ProjectForm lecturers={lecturers} />
    </div>
  );
}
