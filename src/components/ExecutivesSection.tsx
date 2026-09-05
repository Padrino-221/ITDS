"use client";

import { useState } from "react";
import Image from "next/image";
import { Select } from "@/components/admin/Dropdown";
import { initials } from "@/lib/utils";

export type PublicExecutive = {
  id: string;
  name: string;
  position: string;
  photoUrl: string | null;
  ordering: number;
  academicYearId: string;
  academicYear: { id: string; year: string };
};

type YearOpt = { id: string; year: string; active: boolean };

function Portrait({ src, alt, name }: { src: string | null; alt: string; name: string }) {
  return (
    <div className="relative shrink-0 aspect-[4/3] md:aspect-auto md:w-2/5 overflow-hidden bg-forest-50">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-3xl font-bold text-forest-300">
            {initials(name)}
          </span>
        </div>
      )}
    </div>
  );
}

function ExecutiveCard({ exec }: { exec: PublicExecutive }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-forest-100 bg-white transition-transform duration-300 hover:-translate-y-1 flex flex-col md:flex-row">
      <Portrait src={exec.photoUrl} alt={exec.name} name={exec.name} />
      <div className="flex-1 p-7 md:p-8 flex flex-col justify-center">
        <h3 className="font-display text-xl md:text-2xl font-bold text-forest-950 mb-1.5">
          {exec.name}
        </h3>
        <p className="text-gold-600 text-[11px] font-bold uppercase tracking-[0.18em] mb-2">
          {exec.position}
        </p>
        <p className="mt-0.5 text-xs text-ink-soft">{exec.academicYear.year}</p>
      </div>
    </div>
  );
}

export function ExecutivesSection({
  executives,
  academicYears,
}: {
  executives: PublicExecutive[];
  academicYears: YearOpt[];
}) {
  const activeYearId = academicYears.find((y) => y.active)?.id ?? null;
  const defaultFilter =
    activeYearId && executives.some((e) => e.academicYearId === activeYearId)
      ? activeYearId
      : "all";
  const [yearFilter, setYearFilter] = useState<string>(defaultFilter);

  const filtered =
    yearFilter === "all"
      ? executives
      : executives.filter((e) => e.academicYearId === yearFilter);

  return (
    <section className="bg-paper py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center rounded-lg bg-gold-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-600">
              Executives
            </span>
            <h2 className="display-heading mt-3 text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-forest-950">
              Student Executives
            </h2>
            <p className="mt-2 text-sm text-ink-soft max-w-xl">
              Student leaders grouped by their tenure — switch academic year to view past
              executives.
            </p>
          </div>
          <div className="w-full sm:w-64">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Academic Year
            </label>
            <Select
              value={yearFilter}
              onChange={(v) => setYearFilter(v)}
              options={[
                { value: "all", label: `All Years (${executives.length})` },
                ...academicYears.map((y) => ({
                  value: y.id,
                  label: `${y.year}${y.active ? " (Current)" : ""} (${
                    executives.filter((e) => e.academicYearId === y.id).length
                  })`,
                })),
              ]}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-forest-200 bg-white p-12 text-center">
            <p className="font-display text-lg font-bold text-forest-900">
              {yearFilter === "all"
                ? "No executives yet."
                : "No executives for this tenure yet."}
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Executives are added by the department under Staff Panel → Student Leadership.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ex) => (
              <ExecutiveCard key={ex.id} exec={ex} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
