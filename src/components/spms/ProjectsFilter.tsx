"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import { Select } from "@/components/admin/Dropdown";
import { PrimaryButton } from "@/components/admin/ui";
import { DEGREE_LABELS } from "@/lib/data";
import type { DegreeLevel } from "@prisma/client";

type AcademicYear = { academicYear: string | null };

export default function ProjectsFilter({
  academicYears,
  initialSearch,
  initialYear,
  initialDegree,
}: {
  academicYears: AcademicYear[];
  initialSearch: string;
  initialYear: string;
  initialDegree: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const yearOptions = [
    { value: "", label: "All Years" },
    ...academicYears
      .filter((y): y is AcademicYear & { academicYear: string } => y.academicYear !== null)
      .map((y) => ({ value: y.academicYear, label: y.academicYear })),
  ];

  const degreeOptions = [
    { value: "", label: "All Degrees" },
    ...Object.entries(DEGREE_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      const params = new URLSearchParams();
      const search = (form.get("search") as string) || "";
      const year = (form.get("year") as string) || "";
      const degree = (form.get("degree") as string) || "";
      if (search) params.set("search", search);
      if (year) params.set("year", year);
      if (degree) params.set("degree", degree);
      router.push(`/spms/projects?${params.toString()}`);
    },
    [router]
  );

  return (
    <form className="flex flex-wrap gap-3" onSubmit={handleSubmit}>
      <input
        type="text"
        name="search"
        defaultValue={initialSearch}
        placeholder="Search projects…"
        className="flex-1 rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20 sm:min-w-[200px]"
      />
      <Select
        name="year"
        defaultValue={initialYear}
        options={yearOptions}
        placeholder="All Years"
        className="w-44"
      />
      <Select
        name="degree"
        defaultValue={initialDegree}
        options={degreeOptions}
        placeholder="All Degrees"
        className="w-44"
      />
      <PrimaryButton type="submit">Filter</PrimaryButton>
    </form>
  );
}
