"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "All Projects", value: "ALL" },
  { label: "Undergraduate", value: "UNDERGRADUATE" },
  { label: "Diploma", value: "DIPLOMA" },
  { label: "MSc", value: "MSC" },
  { label: "MPhil", value: "MPHIL" },
  { label: "PhD", value: "PHD" },
];

export default function ProjectsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const level = searchParams.get("level") ?? "ALL";

  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          aria-pressed={level === tab.value}
          onClick={() =>
            router.push(tab.value === "ALL" ? "/projects" : `/projects?level=${tab.value}`)
          }
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            level === tab.value
              ? "bg-forest-800 text-white"
              : "border border-forest-200 bg-white text-ink-soft hover:border-forest-400 hover:text-forest-800"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
