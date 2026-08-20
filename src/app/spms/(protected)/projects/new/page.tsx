import { prisma } from "@/lib/prisma";
import { requireSpmsAuth } from "@/lib/spms-auth";
import SpmsProjectForm from "@/components/spms/ProjectForm";

export const metadata = { title: "Upload New Project" };

export default async function NewSpmsProjectPage() {
  const user = await requireSpmsAuth();

  const [lecturers, researchAreas, programs, academicYears] = await Promise.all([
    prisma.lecturer.findMany({ orderBy: { name: "asc" } }),
    prisma.researchArea.findMany({ orderBy: { order: "asc" } }),
    prisma.program.findMany({ orderBy: { title: "asc" } }),
    prisma.setting.findMany({
      where: { key: { startsWith: "spms_year_" } },
      orderBy: { value: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-forest-950">
          Upload New Project
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Add a student project work to the repository.
        </p>
      </div>
      <SpmsProjectForm
        lecturers={lecturers}
        researchAreas={researchAreas}
        programs={programs}
        academicYears={academicYears.map((y) => y.value)}
        userRole={user.role}
        userEmail={user.email}
      />
    </div>
  );
}
