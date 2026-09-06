"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { str, opt } from "@/lib/form-utils";
import { removeUploadFile } from "@/lib/uploads";

function revalidateResources() {
  revalidatePath("/staff-panel/resources");
  revalidatePath("/resources");
}

export async function upsertResource(formData: FormData) {
  await requireAuth();
  const id = str(formData, "id");
  const title = str(formData, "title");
  const description = str(formData, "description");
  const fileUrl = str(formData, "fileUrl");
  const fileName = opt(formData, "fileName");
  const category = str(formData, "category") as "HANDBOOK" | "STUDENT_LIST" | "OTHER";
  const academicYearId = opt(formData, "academicYearId");

  if (!title || !fileUrl) {
    redirect("/staff-panel/resources?toast=resource-required");
  }
  const allowed = ["HANDBOOK", "STUDENT_LIST", "OTHER"];
  const safeCategory = allowed.includes(category) ? category : "HANDBOOK";

  if (academicYearId) {
    const y = await prisma.academicYear.findUnique({ where: { id: academicYearId }, select: { id: true } });
    if (!y) redirect("/staff-panel/resources?toast=year-not-found");
  }

  const data = {
    title,
    description,
    fileUrl,
    fileName,
    category: safeCategory as "HANDBOOK" | "STUDENT_LIST" | "OTHER",
    academicYearId: academicYearId || null,
  };

  let existing: { fileUrl: string } | null = null;
  if (id) existing = await prisma.resource.findUnique({ where: { id }, select: { fileUrl: true } });

  if (id) {
    await prisma.resource.update({ where: { id }, data });
  } else {
    await prisma.resource.create({ data });
  }

  if (existing?.fileUrl && existing.fileUrl !== fileUrl) {
    await removeUploadFile(existing.fileUrl);
  }

  revalidateResources();
  redirect("/staff-panel/resources?toast=" + (id ? "resource-updated" : "resource-created"));
}

export async function deleteResource(id: string) {
  await requireAuth();
  if (!id) return;
  const existing = await prisma.resource.findUnique({ where: { id }, select: { fileUrl: true } });
  await prisma.resource.delete({ where: { id } }).catch(() => null);
  if (existing?.fileUrl) await removeUploadFile(existing.fileUrl);
  revalidateResources();
}
