import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ResearchForm } from "@/components/admin/forms";
import { AdminPageHeader } from "@/components/admin/ui";

export default async function EditResearchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const area = await prisma.researchArea.findUnique({ where: { id } });
  if (!area) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Edit Research Area" description={area.title} />
      <ResearchForm area={area} />
    </div>
  );
}
