import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bookmark, User } from "lucide-react";
import { getLecturers } from "@/lib/data";
import { initials } from "@/lib/utils";

export default async function TeamSection() {
  const allLecturers = await getLecturers();
  const lecturers = allLecturers.slice(0, 4);

  if (lecturers.length === 0) return null;

  return (
    <section className="bg-paper py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-lg bg-gold-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-600">
            Our Team
          </span>
          <h2 className="display-heading mt-5 text-3xl font-extrabold uppercase tracking-tight text-forest-950 sm:text-4xl">
            Meet Our Expert Team
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {lecturers.map((lecturer) => (
            <Link
              key={lecturer.id}
              href={`/lecturers/${lecturer.slug}`}
              className="group block overflow-hidden rounded-3xl border border-forest-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Photo */}
              <div className="relative h-72 overflow-hidden bg-forest-100">
                {lecturer.photo ? (
                  <Image
                    src={lecturer.photo}
                    alt={lecturer.name}
                    fill
                    sizes="25vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-display text-6xl font-extrabold text-forest-300">
                      {initials(lecturer.name)}
                    </span>
                  </div>
                )}
                {/* Bookmark icon */}
                <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm">
                  <Bookmark className="h-4 w-4 text-forest-600" />
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Name + badge */}
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-forest-950">
                    {lecturer.name}
                  </h3>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {/* Bio excerpt */}
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                  {lecturer.bio?.substring(0, 100) || lecturer.title}
                </p>

                {/* CTA */}
                <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-forest-800">
                  <User className="h-4 w-4" />
                  View Profile
                </button>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/lecturers"
            className="inline-flex items-center gap-2 rounded-lg border border-forest-200 bg-white px-6 py-3 text-sm font-bold text-forest-800 transition-all hover:-translate-y-0.5 hover:border-forest-400 hover:shadow-lg"
          >
            View All Lecturers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
