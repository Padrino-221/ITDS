import Link from "next/link";
import { PenLine, Users } from "lucide-react";
import { DataTable, Field, PrimaryButton, SecondaryLink, baseInput } from "../ui";
import DeleteButton from "../DeleteButton";
import {
  deleteTenure,
  setCurrentTenure,
  updateTenure,
} from "@/app/staff-panel/student-leadership/actions";

export type TenureRow = {
  id: string;
  year: string;
  active: boolean;
  executiveCount: number;
};

export function TenureList({
  tenures,
  pagination,
}: {
  tenures: TenureRow[];
  pagination: { page: number; totalPages: number; basePath: string };
}) {
  return (
    <DataTable
      rows={tenures}
      getKey={(t) => t.id}
      emptyMessage="No tenures yet — create the current academic year to start adding executives."
      pagination={pagination}
      columns={[
        {
          key: "year",
          header: "Academic Year",
          cell: (t) => (
            <Link
              href={`/staff-panel/student-leadership/${t.id}`}
              className="font-semibold text-forest-900 hover:text-forest-700"
            >
              {t.year}
            </Link>
          ),
        },
        {
          key: "executiveCount",
          header: "Executives",
          cell: (t) => <span className="text-ink-soft">{t.executiveCount}</span>,
        },
        {
          key: "current",
          header: "Status",
          cell: (t) =>
            t.active ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-forest-50 px-2.5 py-1 text-[11px] font-semibold text-forest-700">
                <span className="h-1.5 w-1.5 rounded-lg bg-forest-500" />
                Current
              </span>
            ) : (
              <form action={setCurrentTenure.bind(null, t.id)}>
                <button
                  type="submit"
                  className="rounded-lg border border-forest-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-forest-800 transition-colors hover:border-forest-400"
                >
                  Make Current
                </button>
              </form>
            ),
        },
        {
          key: "actions",
          header: "Actions",
          align: "right",
          cell: (t) => (
            <div className="flex flex-col items-end gap-2">
              <div className="flex justify-end gap-2">
                <details className="group">
                  <summary className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-forest-200 bg-white px-3 py-1.5 text-xs font-semibold text-forest-800 transition-colors hover:border-forest-400 [&::-webkit-details-marker]:hidden list-none">
                    <PenLine className="h-3.5 w-3.5" />
                    Edit
                  </summary>
                  <form
                    action={updateTenure.bind(null, t.id)}
                    className="mt-2 w-56 space-y-3 rounded-xl border border-forest-100 bg-forest-50/40 p-4 text-left"
                  >
                    <Field label="Academic Year" htmlFor={`tenure-year-${t.id}`}>
                      <input
                        id={`tenure-year-${t.id}`}
                        name="year"
                        defaultValue={t.year}
                        required
                        placeholder="e.g. 2025/2026"
                        className={baseInput}
                      />
                    </Field>
                    <PrimaryButton type="submit" className="w-full">
                      Save
                    </PrimaryButton>
                  </form>
                </details>
                <SecondaryLink href={`/staff-panel/student-leadership/${t.id}`} size="sm">
                  <Users className="h-3.5 w-3.5" />
                  Manage
                </SecondaryLink>
                <DeleteButton
                  action={deleteTenure.bind(null, t.id)}
                  confirmText="Deleting this tenure also removes all executives in it. Continue?"
                />
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}
