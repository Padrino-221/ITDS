import { prisma } from "@/lib/prisma";
import { requireSpmsAdmin } from "@/lib/spms-auth";
import { createAcademicYearAction, deleteAcademicYear } from "../actions";
import {
  AdminPageHeader,
  AdminCard,
  PrimaryButton,
  Field,
} from "@/components/admin/ui";
import { Trash2 } from "lucide-react";

export const metadata = { title: "Settings" };

export default async function SpmsSettingsPage() {
  await requireSpmsAdmin();

  const [academicYears, researchAreas, projectCounts] = await Promise.all([
    prisma.setting.findMany({
      where: { key: { startsWith: "spms_year_" } },
      orderBy: { value: "desc" },
    }),
    prisma.researchArea.findMany({ orderBy: { order: "asc" } }),
    prisma.project.groupBy({
      by: ["academicYear"],
      _count: { id: true },
    }),
  ]);

  const yearCounts = new Map(
    projectCounts.map((pc) => [pc.academicYear, pc._count.id])
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        description="Manage academic years and research areas for the SPMS."
      />

      {/* Academic Years */}
      <AdminCard title="Academic Years">
        <form action={createAcademicYearAction} className="mb-4 flex gap-3">
          <input
            name="name"
            required
            placeholder="e.g. 2025/2026"
            className="flex-1 rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
          />
          <PrimaryButton type="submit">Add Year</PrimaryButton>
        </form>

        {academicYears.length === 0 ? (
          <p className="text-sm text-ink-soft">No academic years configured yet.</p>
        ) : (
          <div className="space-y-2">
            {academicYears.map((year) => (
              <div
                key={year.key}
                className="flex items-center justify-between rounded-lg border border-forest-100 px-4 py-3"
              >
                <div>
                  <span className="font-medium text-forest-900">{year.value}</span>
                  <span className="ml-2 text-xs text-ink-soft">
                    {yearCounts.get(year.value) ?? 0} projects
                  </span>
                </div>
                <form action={deleteAcademicYear.bind(null, year.key)}>
                  <button
                    type="submit"
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Research Areas */}
      <AdminCard
        title="Research Areas"
        action={
          <a
            href="/staff-panel/research"
            className="text-sm font-medium text-forest-600 hover:text-forest-800"
          >
            Manage here →
          </a>
        }
      >
        {researchAreas.length === 0 ? (
          <p className="text-sm text-ink-soft">No research areas configured yet.</p>
        ) : (
          <div className="space-y-2">
            {researchAreas.map((area) => (
              <div
                key={area.id}
                className="flex items-center justify-between rounded-lg border border-forest-100 px-4 py-3"
              >
                <span className="font-medium text-forest-900">{area.title}</span>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
