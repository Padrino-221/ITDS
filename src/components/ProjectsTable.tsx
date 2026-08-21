"use client";

import { useState, useMemo, Fragment } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Search,
  User,
} from "lucide-react";
import { Select } from "@/components/admin/Dropdown";
import { DEGREE_LABELS, formatSupervisorName } from "@/lib/data";
import { cn } from "@/lib/utils";

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  studentName: string | null;
  program: string | null;
  degreeLevel: string;
  academicYear: string | null;
  abstract: string | null;
  objective: string | null;
  groupMembers: string | null;
  githubLink: string | null;
  documentUrl: string | null;
  documentName: string | null;
  supervisor: { name: string; userTitle: string | null } | null;
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function ProjectsTable({
  projects,
  initialLevel,
}: {
  projects: ProjectRow[];
  initialLevel: string;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string>("__row_number");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.studentName?.toLowerCase().includes(q) ||
        (p.supervisor && formatSupervisorName(p.supervisor).toLowerCase().includes(q)) ||
        p.program?.toLowerCase().includes(q) ||
        p.academicYear?.toLowerCase().includes(q)
    );
  }, [projects, search]);

  // Sort
  const sorted = useMemo(() => {
    const withIndex = filtered.map((p, i) => ({ ...p, __row_number: i + 1 }));
    if (sortKey === "__row_number") {
      return sortDir === "asc" ? withIndex : [...withIndex].reverse();
    }
    return [...withIndex].sort((a, b) => {
      const av = (a as any)[sortKey] ?? "";
      const bv = (b as any)[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);
  const startEntry = sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endEntry = Math.min(safePage * pageSize, sorted.length);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortIcon({ columnKey }: { columnKey: string }) {
    if (sortKey !== columnKey) {
      return (
        <span className="ml-1 inline-flex flex-col text-[10px] leading-none text-stone-300">
          <span>▲</span>
          <span>▼</span>
        </span>
      );
    }
    return (
      <span className="ml-1 inline-flex flex-col text-[10px] leading-none text-forest-600">
        <span className={sortDir === "asc" ? "text-forest-800" : "text-stone-300"}>▲</span>
        <span className={sortDir === "desc" ? "text-forest-800" : "text-stone-300"}>▼</span>
      </span>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-ink-soft">
          <span>Show</span>
          <Select
            value={String(pageSize)}
            onChange={(v) => {
              setPageSize(Number(v));
              setPage(1);
            }}
            options={PAGE_SIZE_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))}
            size="sm"
            className="w-20"
          />
          <span>entries</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search projects…"
            className="w-64 rounded-lg border border-stone-200 bg-white py-2 pl-10 pr-3 text-sm text-ink placeholder:text-stone-400 focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-xs font-semibold uppercase tracking-wider text-stone-500">
                <th className="w-16 px-4 py-3">
                  <button onClick={() => toggleSort("__row_number")} className="inline-flex items-center">
                    ### <SortIcon columnKey="__row_number" />
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button onClick={() => toggleSort("title")} className="inline-flex items-center">
                    Project Topic <SortIcon columnKey="title" />
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button onClick={() => toggleSort("supervisor")} className="inline-flex items-center">
                    Main Supervisor <SortIcon columnKey="supervisor" />
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button onClick={() => toggleSort("program")} className="inline-flex items-center">
                    Program Name <SortIcon columnKey="program" />
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button onClick={() => toggleSort("academicYear")} className="inline-flex items-center">
                    Academic Year <SortIcon columnKey="academicYear" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-stone-400">
                    No projects found.
                  </td>
                </tr>
              ) : (
                paged.map((project, idx) => {
                  const isExpanded = expandedId === project.id;
                  const rowNum = startEntry + idx;
                  return (
                    <Fragment key={project.id}>
                      <tr
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-stone-50",
                          isExpanded && "bg-stone-50"
                        )}
                        onClick={() => setExpandedId(isExpanded ? null : project.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-forest-600 text-forest-600 transition-transform",
                                isExpanded && "rotate-45"
                              )}
                              aria-label={isExpanded ? "Collapse" : "Expand"}
                            >
                              <span className="text-sm font-bold leading-none">+</span>
                            </button>
                            <span className="text-stone-500">{rowNum}</span>
                          </div>
                        </td>
                        <td className="max-w-xs px-4 py-3">
                          <span className="line-clamp-1 font-medium text-stone-800">
                            {project.title}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-600">
                          {project.supervisor
                            ? formatSupervisorName(project.supervisor)
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-stone-600">
                          {project.program ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-stone-600">
                          {project.academicYear ?? "—"}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="border-b border-stone-200 bg-stone-50/60 px-4 py-5">
                            <div className="grid gap-6 sm:grid-cols-3">
                              {/* Abstract */}
                              <div className="sm:col-span-2">
                                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-400">
                                  Abstract
                                </h4>
                                <p className="text-sm leading-relaxed text-stone-600 line-clamp-6">
                                  {project.abstract || "No abstract available."}
                                </p>
                              </div>

                              {/* Details sidebar */}
                              <div className="space-y-3">
                                <Detail label="Degree" value={DEGREE_LABELS[project.degreeLevel as keyof typeof DEGREE_LABELS] ?? project.degreeLevel} />
                                {project.studentName && <Detail label="Student" value={project.studentName} />}
                                {project.objective && (
                                  <div>
                                    <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-400">
                                      Objective
                                    </h4>
                                    <p className="text-sm text-stone-600 line-clamp-3">
                                      {project.objective}
                                    </p>
                                  </div>
                                )}
                                {project.groupMembers && (
                                  <div>
                                    <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-400">
                                      Group Members
                                    </h4>
                                    <p className="text-sm text-stone-600">{project.groupMembers}</p>
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2 pt-2">
                                  <Link
                                    href={`/projects/${project.slug}`}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-forest-800 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-forest-700"
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                    View Details
                                  </Link>
                                  {project.documentUrl && (
                                    <a
                                      href={project.documentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:border-forest-400 hover:text-forest-800"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Download className="h-3.5 w-3.5" />
                                      {project.documentName || "Download PDF"}
                                    </a>
                                  )}
                                  {project.githubLink && (
                                    <a
                                      href={project.githubLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:border-forest-400 hover:text-forest-800"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      GitHub
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-stone-500">
        <span>
          Showing {startEntry} to {endEntry} of {sorted.length} entries
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 transition-colors hover:border-stone-300 disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (safePage <= 4) {
                pageNum = i + 1;
              } else if (safePage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = safePage - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    "min-w-[32px] rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors",
                    pageNum === safePage
                      ? "bg-forest-800 text-white"
                      : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 transition-colors hover:border-stone-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}



function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h4 className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-stone-400">
        {label}
      </h4>
      <p className="text-sm font-medium text-stone-700">{value}</p>
    </div>
  );
}
