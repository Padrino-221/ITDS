"use client";

import { useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { DataTable } from "../ui";
import DeleteButton from "../DeleteButton";
import { ExecutiveForm } from "./ExecutiveForm";
import { deleteExecutive } from "@/app/staff-panel/student-leadership/actions";

export type ExecutiveRow = {
  id: string;
  name: string;
  position: string;
  photoUrl: string | null;
  ordering: number;
};

export function ExecutiveList({
  yearId,
  yearLabel,
  executives,
}: {
  yearId: string;
  yearLabel: string;
  executives: ExecutiveRow[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const editExec = executives.find((e) => e.id === editId) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-forest-900">
          {yearLabel} — {executives.length} executive
          {executives.length !== 1 ? "s" : ""}
        </h2>
        <button
          type="button"
          onClick={() => {
            setCreateOpen(!createOpen);
            setEditId(null);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 bg-white px-3 py-2 text-sm font-semibold text-forest-800 transition-colors hover:border-forest-400"
        >
          {createOpen ? (
            <>
              <X className="h-4 w-4" />
              Close
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add Executive
            </>
          )}
        </button>
      </div>

      {createOpen && <ExecutiveForm academicYearId={yearId} onCancel={() => setCreateOpen(false)} />}
      {editExec && <ExecutiveForm academicYearId={yearId} executive={editExec} onCancel={() => setEditId(null)} />}

      <DataTable
        rows={executives}
        getKey={(e) => e.id}
        emptyMessage={`No executives yet for ${yearLabel} — add the council members for this tenure.`}
        columns={[
          {
            key: "name",
            header: "Name",
            cell: (e) => <span className="font-semibold text-forest-900">{e.name}</span>,
          },
          {
            key: "position",
            header: "Position",
            cell: (e) => <span className="text-ink-soft">{e.position}</span>,
          },
          {
            key: "ordering",
            header: "Order",
            cell: (e) => <span className="text-ink-soft">{e.ordering}</span>,
          },
          {
            key: "actions",
            header: "Actions",
            align: "right",
            cell: (e) => (
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditId(e.id);
                    setCreateOpen(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 bg-white px-3 py-1.5 text-xs font-semibold text-forest-800 transition-colors hover:border-forest-400"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <DeleteButton action={deleteExecutive.bind(null, e.id)} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
