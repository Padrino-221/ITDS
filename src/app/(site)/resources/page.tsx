import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { ResourceYearFilter } from "@/components/ResourceYearFilter";
import { prisma } from "@/lib/prisma";
import { BookOpen, DownloadSimple } from "@phosphor-icons/react/dist/ssr";

export const revalidate = 3600;

function fileExt(url: string, name?: string | null) {
  const s = (name || url).split(".").pop() || "";
  return s.slice(0, 4).toUpperCase();
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; year?: string }>;
}) {
  const { category, year: yearParam } = await searchParams;
  const validCats = ["HANDBOOK", "STUDENT_LIST", "OTHER"];
  const filter = category && validCats.includes(category.toUpperCase()) ? category.toUpperCase() : null;

  const [resources, counts] = await Promise.all([
    prisma.resource.findMany({
      where: {
        ...(filter ? { category: filter as "HANDBOOK" | "STUDENT_LIST" | "OTHER" } : {}),
        ...(yearParam ? { academicYear: { is: { year: yearParam } } } : {}),
      },
      include: { academicYear: { select: { year: true } } },
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    }),
    prisma.resource.groupBy({ by: ["category"], _count: { _all: true } }),
  ]);

  const countOf = (c: string) => counts.find((x) => x.category === c)?._count._all ?? 0;

  const academicYears = await prisma.academicYear.findMany({
    where: { resources: { some: {} } },
    orderBy: { year: "desc" },
  });

  const tabs = [
    { key: null, label: `All (${counts.reduce((s, c) => s + c._count._all, 0)})` },
    { key: "HANDBOOK", label: `Handbooks (${countOf("HANDBOOK")})` },
    { key: "STUDENT_LIST", label: `Student Lists (${countOf("STUDENT_LIST")})` },
    { key: "OTHER", label: `Other (${countOf("OTHER")})` },
  ];

  const catHref = (key: string | null) => {
    const base = key ? `/resources?category=${key}` : "/resources";
    return yearParam ? `${base}${base.includes("?") ? "&" : "?"}year=${encodeURIComponent(yearParam)}` : base;
  };

  return (
    <>
      <PageHeader
        title="Resources"
        subtitle="Handbooks, final year project student group lists and other official documents."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Resources" },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-lg bg-gold-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-600">
            Downloads
          </span>
          <h2 className="display-heading mt-5 text-3xl font-extrabold uppercase tracking-tight text-forest-950 sm:text-4xl">All resources</h2>
          <p className="mt-4 leading-relaxed text-ink-soft">Every document uploaded by administration — handbooks and student group lists download the same way.</p>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-forest-100 pt-6 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-3">
            {tabs.map((t) => (
              <Link
                key={t.key ?? "all"}
                href={catHref(t.key)}
                className={`rounded-lg px-5 py-2.5 text-sm font-bold transition ${
                  filter === t.key
                    ? "bg-forest-800 text-white"
                    : "border border-forest-100 bg-white text-ink hover:border-forest-300"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
          <ResourceYearFilter years={academicYears.map((y) => ({ id: y.id, label: y.year }))} currentYear={yearParam ?? null} />
        </div>

        {resources.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-forest-200 bg-white p-12 text-center">
            <BookOpen size={32} weight="duotone" className="mx-auto text-forest-300" />
            <p className="mt-3 font-display font-bold text-forest-900">No resources found</p>
            <p className="mt-1 text-sm text-ink-soft">Try another category or check back later.</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((doc) => (
              <div key={doc.id} className="flex flex-col rounded-2xl border border-forest-100 bg-white p-7">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-gold-600">
                    <BookOpen size={18} weight="duotone" />
                  </span>
                  <span className="rounded-full border border-forest-100 bg-forest-50 px-2.5 py-1 text-xs font-semibold text-ink">
                    {fileExt(doc.fileUrl, doc.fileName)}
                  </span>
                </div>
                <h3 className="mt-4 font-display font-bold text-forest-950 line-clamp-2">{doc.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft line-clamp-2">{doc.description || "No description"}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-gold-50 px-2.5 py-1 font-semibold text-gold-700">
                    {doc.category === "HANDBOOK" ? "Handbook" : doc.category === "STUDENT_LIST" ? "Student List" : "Other"}
                  </span>
                  {doc.academicYear && (
                    <span className="rounded-full border border-forest-100 bg-forest-50 px-2.5 py-1 font-semibold text-ink">
                      {doc.academicYear.year}
                    </span>
                  )}
                </div>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-forest-800 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-forest-700"
                >
                  <DownloadSimple size={14} weight="duotone" /> Download
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
