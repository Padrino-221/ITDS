import Link from "next/link";
import { PageHeader, EmptyState } from "@/components/ui";
import { NewsCard } from "@/components/cards";
import { getNewsCategories, getNewsPosts } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "News & Events",
  description:
    "Latest news, events and announcements from the Department of Information Technology and Decision Sciences, UENR — Sunyani, Ghana.",
  alternates: { canonical: "/news" },
  openGraph: {
    type: "website",
    url: "/news",
    title: "News & Events — ITDS UENR",
    description:
      "Latest news, events and announcements from the Department of Information Technology and Decision Sciences, UENR.",
  },
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, posts] = await Promise.all([
    getNewsCategories(),
    getNewsPosts(),
  ]);

  const filtered = category
    ? posts.filter((p) => p.category === category)
    : posts;

  return (
    <>
      <PageHeader
        title="Department News & Events"
        subtitle="Announcements, events and milestones from the ITDS Department."
        crumbs={[{ label: "Home", href: "/" }, { label: "News & Events" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {categories.length > 1 && (
          <div className="mb-10 flex flex-wrap gap-2">
            <Link
              href="/news"
              aria-pressed={!category}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                !category
                  ? "bg-forest-800 text-white"
                  : "border border-forest-200 bg-white text-ink-soft hover:border-forest-400"
              )}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c}
                href={`/news?category=${encodeURIComponent(c)}`}
                aria-pressed={category === c}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  category === c
                    ? "bg-forest-800 text-white"
                    : "border border-forest-200 bg-white text-ink-soft hover:border-forest-400"
                )}
              >
                {c}
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            title="No news in this category yet"
            description="Check back soon for updates from the department."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
