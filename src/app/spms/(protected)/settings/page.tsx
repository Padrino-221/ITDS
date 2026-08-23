import { prisma } from "@/lib/prisma";
import { requireSpmsAdmin } from "@/lib/spms-auth";
import {
  createAcademicYearAction,
  deleteAcademicYear,
  createSpmsResearchAreaAction,
  updateSpmsResearchArea,
  deleteSpmsResearchArea,
} from "../actions";
import {
  AdminPageHeader,
  AdminCard,
  PrimaryButton,
  Field,
} from "@/components/admin/ui";
import DeleteButton from "@/components/admin/DeleteButton";

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
                <DeleteButton
                  action={deleteAcademicYear.bind(null, year.key)}
                  confirmText={`Delete academic year "${year.value}"? ${yearCounts.get(year.value) ? `This year has ${yearCounts.get(year.value)} associated project${yearCounts.get(year.value) === 1 ? "" : "s"}.` : ""}`}
                  label=""
                  className="inline-flex items-center justify-center rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50"
                />
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Research Areas */}
      <AdminCard title="Research Areas">
        <form
          action={createSpmsResearchAreaAction}
          className="mb-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <Field label="Title">
            <input
              name="title"
              required
              placeholder="e.g. Machine Learning"
              className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </Field>
          <Field label="Description (optional)">
            <input
              name="description"
              placeholder="Short description…"
              className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </Field>
          <div className="flex items-end">
            <PrimaryButton type="submit">Add Area</PrimaryButton>
          </div>
        </form>

        {researchAreas.length === 0 ? (
          <p className="text-sm text-ink-soft">No research areas configured yet.</p>
        ) : (
          <div className="space-y-2">
            {researchAreas.map((area) => (
              <form
                key={area.id}
                action={updateSpmsResearchArea.bind(null, area.id)}
                className="grid items-center gap-3 rounded-lg border border-forest-100 px-4 py-3 sm:grid-cols-[1fr_1.5fr_auto]"
              >
                <input
                  name="title"
                  required
                  defaultValue={area.title}
                  aria-label={`Title for ${area.title}`}
                  className="w-full rounded-lg border border-transparent bg-stone-50 px-3 py-2 text-sm font-medium text-forest-900 transition-colors hover:border-forest-200 focus:border-forest-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                />
                <input
                  name="description"
                  defaultValue={area.description}
                  placeholder="Short description…"
                  aria-label={`Description for ${area.title}`}
                  className="w-full rounded-lg border border-transparent bg-stone-50 px-3 py-2 text-sm text-ink-soft transition-colors hover:border-forest-200 focus:border-forest-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="submit"
                    className="rounded-lg border border-forest-200 bg-white px-3 py-1.5 text-xs font-semibold text-forest-700 transition-colors hover:border-forest-400 hover:bg-forest-50"
                  >
                    Save
                  </button>
                  <DeleteButton action={deleteSpmsResearchArea.bind(null, area.id)} />
                </div>
              </form>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
