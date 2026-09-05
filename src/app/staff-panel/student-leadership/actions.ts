"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { str, opt } from "@/lib/form-utils";

function revalidateLeadership() {
  revalidatePath("/staff-panel/student-leadership");
  revalidatePath("/staff-panel/student-leadership/[id]");
  revalidatePath("/about/it-society");
}

// ------------------------------------------------------------------
// Tenures (academic years)
// ------------------------------------------------------------------

export async function createTenure(formData: FormData) {
  await requireAuth();
  const year = str(formData, "year");

  if (!year) {
    redirect("/staff-panel/student-leadership?toast=year-required");
  }

  const exists = await prisma.academicYear.findUnique({ where: { year } });
  if (exists) {
    redirect("/staff-panel/student-leadership?toast=year-exists");
  }

  // The first tenure becomes the current one automatically.
  const activeCount = await prisma.academicYear.count({ where: { active: true } });
  await prisma.academicYear.create({ data: { year, active: activeCount === 0 } });

  revalidateLeadership();
  redirect("/staff-panel/student-leadership?toast=year-created");
}

export async function setCurrentTenure(id: string) {
  await requireAuth();
  if (!id) return;

  await prisma.academicYear.updateMany({ data: { active: false } });
  await prisma.academicYear.update({ where: { id }, data: { active: true } });
  revalidateLeadership();
  redirect("/staff-panel/student-leadership?toast=year-current");
}

export async function deleteTenure(id: string) {
  await requireAuth();
  if (!id) return;

  // Executives tied to this tenure are removed with it (onDelete: Cascade).
  await prisma.academicYear.delete({ where: { id } }).catch(() => null);
  revalidateLeadership();
  redirect("/staff-panel/student-leadership?toast=year-deleted");
}

// ------------------------------------------------------------------
// Executives
// ------------------------------------------------------------------

export async function upsertExecutive(formData: FormData) {
  await requireAuth();
  const id = str(formData, "id");
  const academicYearId = str(formData, "academicYearId");
  const name = str(formData, "name");
  const position = str(formData, "position");
  const photoUrl = opt(formData, "photoUrl");
  const ordering = Number(formData.get("ordering") ?? 0) || 0;

  const listPath = `/staff-panel/student-leadership/${academicYearId}`;

  if (!academicYearId || !name || !position) {
    redirect(listPath + "?toast=exec-required");
  }

  const yearExists = await prisma.academicYear.findUnique({
    where: { id: academicYearId },
    select: { id: true },
  });
  if (!yearExists) {
    redirect("/staff-panel/student-leadership?toast=year-not-found");
  }

  const data = { name, position, photoUrl, ordering, academicYearId };

  if (id) {
    await prisma.studentExecutive.update({ where: { id }, data });
  } else {
    await prisma.studentExecutive.create({ data });
  }

  revalidateLeadership();
  redirect(listPath + "?toast=" + (id ? "exec-updated" : "exec-created"));
}

export async function deleteExecutive(id: string) {
  await requireAuth();
  if (!id) return;

  const exec = await prisma.studentExecutive.findUnique({
    where: { id },
    select: { academicYearId: true },
  });
  await prisma.studentExecutive.delete({ where: { id } }).catch(() => null);
  revalidateLeadership();

  if (exec) {
    redirect(`/staff-panel/student-leadership/${exec.academicYearId}?toast=exec-deleted`);
  }
  redirect("/staff-panel/student-leadership?toast=exec-deleted");
}
