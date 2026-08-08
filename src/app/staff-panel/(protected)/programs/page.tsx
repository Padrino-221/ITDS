import { prisma } from "@/lib/prisma";
import { DEGREE_LABELS } from "@/lib/data";
import {
  AdminCard,
  AdminPageHeader,
  SecondaryLink,
} from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { Pencil } from "lucide-react";

export const metadata = { title: "Programmes — Admin" };

export default async function AdminProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const programs = await prisma.program.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Programmes"
        description={`${programs.length} programme(s) configured.`}
      />
      <SavedToast saved={saved} message="Programme updated successfully." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <AdminCard key={program.id} className="flex flex-col">
            <h3 className="font-display text-lg font-bold text-forest-900">
              {DEGREE_LABELS[program.degreeLevel]}
            </h3>
            <p className="mt-1 text-xs text-ink-soft">
              {program.title}
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-ink-soft">
              {program.overview.substring(0, 100)}...
            </p>
            <SecondaryLink
              href={`/staff-panel/programs/${program.id}/edit`}
              size="sm"
              className="mt-4 self-start"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Content
            </SecondaryLink>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
