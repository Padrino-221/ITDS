import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DEGREE_LABELS } from "@/lib/data";
import { AdminPageHeader } from "@/components/admin/ui";
import { ProgramForm } from "@/components/admin/forms";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await prisma.program.findUnique({ where: { id } });
  if (!program) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edit Programme"
        description={`${DEGREE_LABELS[program.degreeLevel]} — ${program.title}`}
      />
      <ProgramForm program={program} />
    </div>
  );
}
