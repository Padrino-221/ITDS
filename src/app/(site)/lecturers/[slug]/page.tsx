import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, FolderOpen, Sparkles } from "lucide-react";
import { ProjectCard } from "@/components/cards";
import { getLecturerBySlug, getLecturers } from "@/lib/data";
import { initials } from "@/lib/utils";

export async function generateStaticParams() {
  const lecturers = await getLecturers();
  return lecturers.map((lecturer) => ({ slug: lecturer.slug }));
}

export default async function LecturerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lecturer = await getLecturerBySlug(slug);
  if (!lecturer) notFound();

  const interests = lecturer.researchInterests
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <section className="border-b border-forest-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/lecturers"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-forest-700 hover:text-forest-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lecturers
          </Link>

          <div className="grid items-start gap-10 md:grid-cols-[280px_1fr]">
            <div className="relative mx-auto w-full max-w-[280px]">
              <div className="relative h-[320px] overflow-hidden rounded-xl bg-forest-100">
                {lecturer.photo ? (
                  <Image
                    src={lecturer.photo}
                    alt={lecturer.name}
                    fill
                    priority
                    sizes="280px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-display text-7xl font-bold text-forest-400">
                      {initials(lecturer.name)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
                Faculty Profile
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-forest-900 sm:text-4xl">
                {lecturer.name}
              </h1>
              <p className="mt-1 text-lg text-ink-soft">{lecturer.title}</p>

              {lecturer.bio && (
                <p className="mt-5 max-w-3xl leading-relaxed text-ink-soft">
                  {lecturer.bio}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                {interests?.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gold-200 bg-gold-50 px-3 py-1.5 text-xs font-medium text-gold-800"
                  >
                    <Sparkles className="h-3 w-3" />
                    {interest}
                  </span>
                ))}
              </div>

              {lecturer.email && (
                <a
                  href={`mailto:${lecturer.email}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-forest-800 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-700"
                >
                  <Mail className="h-4 w-4" />
                  {lecturer.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {lecturer.projects.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-forest-900">
            <FolderOpen className="h-5 w-5 text-gold-600" />
            Supervised Project Works
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lecturer.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
