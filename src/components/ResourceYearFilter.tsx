"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/admin/Dropdown";

export function ResourceYearFilter({
  years,
  currentYear,
}: {
  years: { id: string; label: string }[];
  currentYear: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const options = [{ value: "", label: "All years" }, ...years.map((y) => ({ value: y.label, label: y.label }))];

  const handleChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set("year", val);
    else params.delete("year");
    const qs = params.toString();
    router.push(qs ? `/resources?${qs}` : "/resources");
  };

  return (
    <div className="w-full sm:w-56">
      <Select value={currentYear ?? ""} onChange={handleChange} options={options} placeholder="All years" />
    </div>
  );
}
