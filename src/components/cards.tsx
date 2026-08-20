import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Brain,
  CalendarDays,
  ChartPie,
  Download,
  FolderOpen,
  Globe,
  Shield,
  Smartphone,
  User,
} from "lucide-react";
import type { NewsPost, Project, Lecturer, ResearchArea } from "@prisma/client";
import { Badge } from "./ui";
import { DEGREE_LABELS } from "@/lib/data";
import { formatDate, initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const researchIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  brain: Brain,
  globe: Globe,
  smartphone: Smartphone,
  shield: Shield,
  chart: ChartPie,
};

export function NewsCard({
  post,
  variant = "light",
}: {
  post: NewsPost;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";

  return (
    <Link
      href={`/news/${post.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-2",
        isDark
          ? "border-white/10 bg-white"
          : "border-forest-100 bg-white hover:border-gold-300"
      )}
    >
      <div className="relative h-48 overflow-hidden">
        {post.image ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-forest-100">
            <FolderOpen className="h-10 w-10 text-forest-400" />
          </div>
        )}
        <Badge className="absolute left-3 top-3 bg-gold-500 text-white">
          {post.category}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
          <CalendarDays className="h-3.5 w-3.5 text-gold-500" />
          {formatDate(post.publishedAt)}
        </p>
        <h3 className="mt-2 font-display text-lg font-extrabold leading-snug text-forest-950 transition-colors group-hover:text-gold-600">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">
            {post.excerpt}
          </p>
        )}
        <span className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-bold text-gold-600 transition-colors">
          Read More
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function ProjectCard({
  project,
}: {
  project: Project & { supervisor?: { name: string; slug: string } | null };
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-forest-100 bg-white transition-all duration-300 hover:-translate-y-2 hover:border-gold-300"
    >
      <div className="relative h-44 overflow-hidden">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-forest-100">
            <FolderOpen className="h-10 w-10 text-forest-400" />
          </div>
        )}
        <Badge className="absolute left-3 top-3 bg-forest-950 text-gold-400">
          {DEGREE_LABELS[project.degreeLevel]}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-extrabold leading-snug text-forest-950 transition-colors group-hover:text-gold-600">
          {project.title}
        </h3>
        <div className="mt-3 space-y-1.5 text-sm text-ink-soft">
          {project.studentName && (
            <p className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-gold-500" />
              {project.studentName}
            </p>
          )}
          <p className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-gold-500" />
            {project.academicYear ?? "—"}
          </p>
          {project.supervisor && (
            <p className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-gold-500" />
              {project.supervisor.name}
            </p>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="flex items-center gap-1.5 text-sm font-bold text-gold-600 transition-colors">
            View Project
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
          {'documentUrl' in project && project.documentUrl && (
            <span className="flex items-center gap-1 rounded-full bg-forest-50 px-2.5 py-1 text-xs font-semibold text-forest-700">
              <Download className="h-3 w-3" />
              PDF
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function LecturerCard({
  lecturer,
}: {
  lecturer: Lecturer & { _count?: { projects: number } };
}) {
  return (
    <Link
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
            sizes="(min-width: 1024px) 25vw, 100vw"
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

        {/* Projects count */}
        <div className="mt-4 flex items-center gap-2 border-t border-forest-50 pt-4">
          <FolderOpen className="h-4 w-4 text-forest-500" />
          <p className="text-sm font-medium text-ink-soft">
            {lecturer._count?.projects ?? 0} supervised projects
          </p>
        </div>

        {/* CTA */}
        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-forest-800">
          <User className="h-4 w-4" />
          View Profile
        </button>
      </div>
    </Link>
  );
}

export function ResearchAreaCard({ area }: { area: ResearchArea }) {
  const Icon = researchIcons[area.icon ?? ""] ?? Globe;
  return (
    <Link
      href={`/research#${area.slug}`}
      className="group flex flex-col rounded-2xl border border-forest-100 bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:border-gold-300"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-forest-50 text-forest-700 transition-colors group-hover:bg-gold-500 group-hover:text-white">
        <Icon className="h-7 w-7" />
      </span>
      <h3 className="mt-4 font-display text-lg font-extrabold text-forest-950">
        {area.title}
      </h3>
      <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-ink-soft">
        {area.description}
      </p>
      <span className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-bold text-gold-600 transition-colors">
        Learn More
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
