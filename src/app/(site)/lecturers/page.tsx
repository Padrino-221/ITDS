import { PageHeader, EmptyState } from "@/components/ui";
import { LecturerCard } from "@/components/cards";
import { getLecturers } from "@/lib/data";

export const metadata = { title: "Lecturers" };

export default async function LecturersPage() {
  const lecturers = await getLecturers();

  return (
    <>
      <PageHeader
        title="Our Skilled Lecturers"
        subtitle="Meet the academics and researchers who teach, mentor and supervise across the ITDS Department."
        crumbs={[{ label: "Home", href: "/" }, { label: "Lecturers" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {lecturers.length === 0 ? (
          <EmptyState
            title="No lecturers listed yet"
            description="Faculty profiles will appear here once published."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lecturers.map((lecturer) => (
              <LecturerCard key={lecturer.id} lecturer={lecturer} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
