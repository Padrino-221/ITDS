"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { DataTable } from "@/components/admin/ui";
import DeleteButton from "@/components/admin/DeleteButton";
import { ResourceForm } from "./ResourceForm";
import { deleteResource } from "@/app/staff-panel/resources/actions";
import type { Resource } from "@prisma/client";

type AcademicYear = { id: string; year: string };
type ResourceRow = Resource & { academicYear: { year: string } | null };

export function ResourceList({
  resources,
  academicYears,
}: {
  resources: ResourceRow[];
  academicYears: AcademicYear[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const editResource = resources.find((r) => r.id === editId) ?? null;

  const columns: Parameters<typeof DataTable<ResourceRow>>[0]["columns"] = [
    {
      key: "title",
      header: "Title",
      cell: (r) => (
        <div>
          <p className="font-semibold text-forest-900">{r.title}</p>
          <p className="text-xs text-ink-soft line-clamp-1">{r.description || "—"}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (r) => <span className="text-xs font-semibold text-ink-soft">{r.category === "HANDBOOK" ? "Handbook" : r.category === "STUDENT_LIST" ? "Student List" : "Other"}</span>,
    },
    {
      key: "year",
      header: "Year",
      cell: (r) => <span className="text-xs text-ink-soft">{r.academicYear?.year ?? "—"}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (r) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setEditId(r.id);
              setCreateOpen(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 bg-white px-3 py-1.5 text-xs font-semibold text-forest-800 hover:border-forest-400"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <DeleteButton action={deleteResource.bind(null, r.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">{resources.length} resource{resources.length !== 1 ? "s" : ""}</p>
        <button
          type="button"
          onClick={() => {
            setCreateOpen((v) => !v);
            setEditId(null);
          }}
          className="rounded-lg bg-forest-800 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-700"
        >
          {createOpen ? "Close" : "New resource"}
        </button>
      </div>

      {createOpen && <ResourceForm academicYears={academicYears} />}
      {editResource && <ResourceForm resource={editResource} academicYears={academicYears} />}

      <DataTable columns={columns} rows={resources} getKey={(r) => r.id} emptyMessage="No resources yet. Upload your first document." />
    </div>
  );
}
