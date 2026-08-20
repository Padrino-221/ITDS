import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSpmsAuth } from "@/lib/spms-auth";
import { DEGREE_LABELS } from "@/lib/data";
import {
  AdminPageHeader,
  AdminCard,
  PrimaryLink,
  SecondaryLink,
  StatusBadge,
} from "@/components/admin/ui";
import { FolderOpen, Pencil, Download, User, Plus, Users, GraduationCap } from "lucide-react";

export default async function SpmsDashboardPage() {
  const user = await requireSpmsAuth();
  const isAdmin = user.role === "ADMIN";

  // Profile completion check
  const profile = await prisma.supervisor.findUnique({
    where: { id: user.id },
    select: {
      userTitle: true,
      gender: true,
      jobRank: true,
      phone: true,
      linkedin: true,
      researchArea1: true,
      researchArea2: true,
      profilePhoto: true,
    },
  });

  const profileFields = [
    profile?.userTitle,
    profile?.gender,
    profile?.jobRank,
    profile?.phone,
    profile?.linkedin,
    profile?.researchArea1,
    profile?.researchArea2,
    profile?.profilePhoto,
  ];
  const filledFields = profileFields.filter(Boolean).length;
  const profilePercent = Math.round((filledFields / profileFields.length) * 100);

  // Stats — for lecturers, find projects linked to their Lecturer profile
  const supervisorRecord = await prisma.supervisor.findUnique({
    where: { id: user.id },
    select: { lecturerId: true },
  });
  const whereClause = isAdmin ? {} : { supervisorId: supervisorRecord?.lecturerId ?? "__none__" };

  const [totalProjects, projectsThisYear, recentProjects, totalUsers] =
    await Promise.all([
      prisma.project.count({ where: whereClause }),
      prisma.project.count({
        where: {
          ...whereClause,
          academicYear: { contains: String(new Date().getFullYear()) },
        },
      }),
      prisma.project.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          academicYear: true,
          degreeLevel: true,
          documentUrl: true,
          createdAt: true,
          supervisor: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      isAdmin ? prisma.supervisor.count() : Promise.resolve(0),
    ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description={isAdmin ? "Admin Dashboard" : "Manage your supervised projects"}
        action={
          <PrimaryLink href="/spms/projects/new">
            <Plus className="h-4 w-4" />
            New Project
          </PrimaryLink>
        }
      />

      {/* Profile completion banner */}
      {profilePercent < 100 && (
        <Link
          href="/spms/profile"
          className="block rounded-xl border border-gold-200 bg-gold-50 p-4 transition-colors hover:bg-gold-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gold-600" />
              <div>
                <p className="text-sm font-semibold text-gold-800">
                  Complete your profile ({profilePercent}% done)
                </p>
                <p className="text-xs text-gold-600">
                  Add your research areas, contact info, and photo to help students find you.
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-gold-700">{profilePercent}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gold-200">
            <div
              className="h-full rounded-full bg-gold-500 transition-all"
              style={{ width: `${profilePercent}%` }}
            />
          </div>
        </Link>
      )}

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/spms/projects"
          className="group rounded-xl border border-forest-100 bg-white p-5 transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-700 transition-colors group-hover:bg-forest-800 group-hover:text-gold-300">
              <FolderOpen className="h-5 w-5" />
            </span>
            <span className="font-display text-3xl font-bold text-forest-900">
              {totalProjects}
            </span>
          </div>
          <p className="mt-3 text-sm font-medium text-ink-soft">Total Projects</p>
        </Link>

        <Link
          href="/spms/projects"
          className="group rounded-xl border border-forest-100 bg-white p-5 transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-700 transition-colors group-hover:bg-forest-800 group-hover:text-gold-300">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="font-display text-3xl font-bold text-forest-900">
              {projectsThisYear}
            </span>
          </div>
          <p className="mt-3 text-sm font-medium text-ink-soft">This Year</p>
        </Link>

        {isAdmin && (
          <Link
            href="/spms/users"
            className="group rounded-xl border border-forest-100 bg-white p-5 transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-700 transition-colors group-hover:bg-forest-800 group-hover:text-gold-300">
                <Users className="h-5 w-5" />
              </span>
              <span className="font-display text-3xl font-bold text-forest-900">
                {totalUsers}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-ink-soft">System Users</p>
          </Link>
        )}

        <Link
          href="/spms/projects/new"
          className="group rounded-xl border border-forest-100 bg-white p-5 transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-700 transition-colors group-hover:bg-forest-800 group-hover:text-gold-300">
              <Plus className="h-5 w-5" />
            </span>
            <span className="font-display text-3xl font-bold text-forest-900">+</span>
          </div>
          <p className="mt-3 text-sm font-medium text-ink-soft">New Project</p>
        </Link>
      </div>

      {/* Recent projects */}
      <AdminCard
        title={isAdmin ? "Recent Projects" : "Your Recent Projects"}
        action={
          <SecondaryLink href="/spms/projects" size="sm">
            View all →
          </SecondaryLink>
        }
      >
        {recentProjects.length === 0 ? (
          <div className="py-12 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-stone-300" />
            <p className="mt-3 text-sm text-ink-soft">No projects yet.</p>
            <PrimaryLink href="/spms/projects/new" className="mt-3 inline-flex">
              <Plus className="h-4 w-4" />
              Upload your first project
            </PrimaryLink>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-forest-100 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Year</th>
                  <th className="px-5 py-3">Supervisor</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-50">
                {recentProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-forest-50/40">
                    <td className="px-5 py-3">
                      <span className="line-clamp-1 font-medium text-forest-900">
                        {project.title}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">
                      {project.academicYear ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-soft">
                      {project.supervisor?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <SecondaryLink
                          href={`/spms/projects/${project.id}/edit`}
                          size="sm"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </SecondaryLink>
                        {project.documentUrl && (
                          <SecondaryLink
                            href={project.documentUrl}
                            size="sm"
                          >
                            <Download className="h-3 w-3" />
                            PDF
                          </SecondaryLink>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}


