"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  authenticate,
  createSession,
  destroySession,
  hashPassword,
  requireAdmin,
  requireAuth,
} from "@/lib/auth";
import { slugify, learnUrl } from "@/lib/utils";
import { removeUploadFile } from "@/lib/uploads";
import { str, opt, bool } from "@/lib/form-utils";

type SlugModel = "newsPost" | "researchArea";

type SlugWhere = { slug: string; id?: { not: string } };

async function uniqueSlug(
  base: string,
  model: SlugModel,
  excludeId?: string
): Promise<string> {
  const baseSlug = slugify(base) || "untitled";
  let candidate = baseSlug;
  let n = 2;
  while (true) {
    const where: SlugWhere = {
      slug: candidate,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    };
    let existing: { id: string } | null = null;
    switch (model) {
      case "newsPost":
        existing = await prisma.newsPost.findFirst({ where, select: { id: true } });
        break;
      case "researchArea":
        existing = await prisma.researchArea.findFirst({ where, select: { id: true } });
        break;
    }
    if (!existing) return candidate;
    candidate = `${baseSlug}-${n++}`;
  }
}

function revalidateAll() {
  revalidatePath("/", "layout");
  revalidatePath("/about");
  revalidatePath("/about/it-society");
  revalidatePath("/contact");
  revalidatePath("/staff-panel", "layout");
}

// ------------------------------------------------------------------
// Authentication
// ------------------------------------------------------------------

export async function login(prev: { error?: string }, formData: FormData) {
  const email = str(formData, "email");
  const password = str(formData, "password");

  const user = await authenticate(email, password);
  if (!user) {
    return { error: "Invalid email or password." };
  }
  await createSession(user);
  // Lecturers don't get content management — they author e-learning lessons
  // on /learn, so send them straight to the author dashboard.
  if (user.role === "LECTURER") {
    redirect(learnUrl("/author"));
  }
  redirect("/staff-panel");
}

export async function logout() {
  await destroySession();
  redirect("/staff-panel/login");
}

// ------------------------------------------------------------------
// News
// ------------------------------------------------------------------

const newsSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  category: z.string().min(1, "Category is required."),
  image: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(10, "Content must be at least 10 characters."),
});

export async function createNews(formData: FormData) {
  await requireAuth();
  const parsed = newsSchema.safeParse({
    title: str(formData, "title"),
    category: str(formData, "category"),
    image: opt(formData, "image") ?? undefined,
    excerpt: opt(formData, "excerpt") ?? undefined,
    content: str(formData, "content"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");
  }
  const slug = await uniqueSlug(parsed.data.title, "newsPost");
  await prisma.newsPost.create({
    data: {
      ...parsed.data,
      slug,
      published: bool(formData, "published"),
      publishedAt: new Date(),
    },
  });
  revalidateAll();
  redirect("/staff-panel/news?saved=1");
}

export async function updateNews(id: string, formData: FormData) {
  await requireAuth();
  const existing = await prisma.newsPost.findUnique({ where: { id } });
  const parsed = newsSchema.safeParse({
    title: str(formData, "title"),
    category: str(formData, "category"),
    image: opt(formData, "image") ?? undefined,
    excerpt: opt(formData, "excerpt") ?? undefined,
    content: str(formData, "content"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");
  }
  const slug = await uniqueSlug(parsed.data.title, "newsPost", id);
  await prisma.newsPost.update({
    where: { id },
    data: { ...parsed.data, slug, published: bool(formData, "published") },
  });
  if (existing?.image && parsed.data.image && existing.image !== parsed.data.image) {
    await removeUploadFile(existing.image);
  }
  revalidateAll();
  redirect("/staff-panel/news?saved=1");
}

export async function deleteNews(id: string) {
  await requireAuth();
  const existing = await prisma.newsPost.findUnique({ where: { id } });
  await prisma.newsPost.delete({ where: { id } });
  if (existing?.image) await removeUploadFile(existing.image);
  revalidateAll();
}

// ------------------------------------------------------------------
// Research areas
// ------------------------------------------------------------------

const researchSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  image: z.string().optional(),
  icon: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
});

export async function createResearchArea(formData: FormData) {
  await requireAuth();
  const parsed = researchSchema.safeParse({
    title: str(formData, "title"),
    description: str(formData, "description"),
    image: opt(formData, "image") ?? undefined,
    icon: opt(formData, "icon") ?? undefined,
    order: Number(formData.get("order") ?? 0),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");
  }
  const slug = await uniqueSlug(parsed.data.title, "researchArea");
  await prisma.researchArea.create({ data: { ...parsed.data, slug } });
  revalidateAll();
  redirect("/staff-panel/research?saved=1");
}

export async function updateResearchArea(id: string, formData: FormData) {
  await requireAuth();
  const existing = await prisma.researchArea.findUnique({ where: { id } });
  const parsed = researchSchema.safeParse({
    title: str(formData, "title"),
    description: str(formData, "description"),
    image: opt(formData, "image") ?? undefined,
    icon: opt(formData, "icon") ?? undefined,
    order: Number(formData.get("order") ?? 0),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");
  }
  const slug = await uniqueSlug(parsed.data.title, "researchArea", id);
  await prisma.researchArea.update({
    where: { id },
    data: { ...parsed.data, slug },
  });
  if (existing?.image && parsed.data.image && existing.image !== parsed.data.image) {
    await removeUploadFile(existing.image);
  }
  revalidateAll();
  redirect("/staff-panel/research?saved=1");
}

export async function deleteResearchArea(id: string) {
  await requireAuth();
  const existing = await prisma.researchArea.findUnique({ where: { id } });
  await prisma.researchArea.delete({ where: { id } });
  if (existing?.image) await removeUploadFile(existing.image);
  revalidateAll();
}

// ------------------------------------------------------------------
// Programs
// ------------------------------------------------------------------

const programSchema = z.object({
  overview: z.string().min(10, "Overview must be at least 10 characters."),
  learningObjectives: z.string().min(10, "Learning objectives must be at least 10 characters."),
  curriculumStructure: z.string().min(10, "Curriculum structure must be at least 10 characters."),
  programmeContact: z.string().min(5, "Programme contact is required."),
});

export async function updateProgram(id: string, formData: FormData) {
  await requireAuth();
  const parsed = programSchema.safeParse({
    overview: str(formData, "overview"),
    learningObjectives: str(formData, "learningObjectives"),
    curriculumStructure: str(formData, "curriculumStructure"),
    programmeContact: str(formData, "programmeContact"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");
  }
  await prisma.program.update({
    where: { id },
    data: parsed.data,
  });
  revalidateAll();
  redirect("/staff-panel/programs?saved=1");
}

// ------------------------------------------------------------------
// Settings
// ------------------------------------------------------------------

const jsonFields = [
  "hero_slides",
  "stats",
  "featured_links",
  "core_values",
  "acronym_values",
  "spms_highlights",
  "its_objectives",
] as const;

export async function updateSettings(formData: FormData) {
  await requireAuth();

  const textFields = [
    "site_name",
    "announcement",
    "about_story",
    "about_vision",
    "about_mission",
    "its_story",
    "about_image_story",
    "about_image_spms",
  ] as const;

  const updates: Array<[string, string]> = [];

  for (const key of textFields) {
    updates.push([key, str(formData, key)]);
  }

  // Rebuild JSON blobs from individual fields
  let previousWelcomeImage = "";
  try {
    const prev = JSON.parse(
      (await prisma.setting.findUnique({ where: { key: "welcome" } }))?.value ?? "{}"
    ) as Record<string, string>;
    previousWelcomeImage = prev.image ?? "";
  } catch {
    previousWelcomeImage = "";
  }
  const newWelcomeImage = str(formData, "welcome_image");
  if (previousWelcomeImage && newWelcomeImage !== previousWelcomeImage) {
    await removeUploadFile(previousWelcomeImage);
  }

  const welcome = JSON.stringify({
    heading: str(formData, "welcome_heading"),
    name: str(formData, "welcome_name"),
    title: str(formData, "welcome_title"),
    image: newWelcomeImage,
    message: str(formData, "welcome_message"),
  });
  const contact = JSON.stringify({
    email: str(formData, "contact_email"),
    phone: str(formData, "contact_phone"),
    address: str(formData, "contact_address"),
    hours: str(formData, "contact_hours"),
  });
  const socials = JSON.stringify({
    facebook: str(formData, "social_facebook"),
    twitter: str(formData, "social_twitter"),
    instagram: str(formData, "social_instagram"),
    linkedin: str(formData, "social_linkedin"),
    youtube: str(formData, "social_youtube"),
  });

  updates.push(["welcome", welcome], ["contact", contact], ["socials", socials]);

  // Remove replaced About-page images (only files under /uploads/ are deleted;
  // the default /images/about/*.jpg live in the repo and are left intact).
  for (const key of ["about_image_story", "about_image_spms"] as const) {
    const prev = (await prisma.setting.findUnique({ where: { key } }))?.value ?? "";
    const next = str(formData, key);
    if (prev && next && prev !== next) {
      await removeUploadFile(prev);
    }
  }

  // Remove hero slide images that were dropped or replaced.
  try {
    const prevSlides = JSON.parse(
      (await prisma.setting.findUnique({ where: { key: "hero_slides" } }))?.value ?? "[]"
    ) as Array<{ image?: string }>;
    const nextSlides = JSON.parse(str(formData, "hero_slides")) as Array<{
      image?: string;
    }>;
    for (const prev of prevSlides) {
      if (!prev?.image) continue;
      const stillUsed = nextSlides.some((s) => s?.image === prev.image);
      if (!stillUsed) await removeUploadFile(prev.image);
    }
  } catch {
    // Nothing to clean up when hero_slides is empty or invalid.
  }

  // Validate + store raw JSON textareas
  for (const key of jsonFields) {
    const raw = str(formData, key);
    if (!raw) continue;
    try {
      JSON.parse(raw);
    } catch {
      throw new Error(`${key} is not valid JSON.`);
    }
    updates.push([key, raw]);
  }

  for (const [key, value] of updates) {
    if (!value) continue;
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  revalidateAll();
  redirect("/staff-panel/settings?saved=1");
}

// ------------------------------------------------------------------
// Messages
// ------------------------------------------------------------------

export async function toggleMessageRead(id: string) {
  await requireAuth();
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (message) {
    await prisma.contactMessage.update({
      where: { id },
      data: { read: !message.read },
    });
  }
  revalidatePath("/staff-panel/messages");
}

export async function deleteMessage(id: string) {
  await requireAuth();
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/staff-panel/messages");
}

// ------------------------------------------------------------------
// Newsletter subscribers
// ------------------------------------------------------------------

export async function deleteSubscriber(id: string) {
  await requireAuth();
  await prisma.newsletterSubscriber.delete({ where: { id } });
  revalidatePath("/staff-panel/subscribers");
}

// ------------------------------------------------------------------
// Users (admin only)
// ------------------------------------------------------------------

export async function createUser(formData: FormData) {
  await requireAdmin();
  const name = str(formData, "name");
  const email = str(formData, "email");
  const password = str(formData, "password");
  const role = str(formData, "role") as Role;

  if (!name || !email || password.length < 8) {
    throw new Error("Name, valid email and a password of at least 8 characters are required.");
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    throw new Error("A user with this email already exists.");
  }

  const allowedRoles: Role[] = ["ADMIN", "EDITOR", "LECTURER"];
  const safeRole = allowedRoles.includes(role) ? role : "EDITOR";

  await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      role: safeRole,
    },
  });
  revalidatePath("/staff-panel/users");
  redirect("/staff-panel/users?saved=1");
}

export async function deleteUser(id: string) {
  await requireAdmin();
  const session = await requireAuth();
  if (session.id === id) {
    throw new Error("You cannot delete your own account.");
  }
  // Remove the account together with any lessons they authored, so staff
  // accounts are never stuck undeletable. Learner progress on those lessons
  // cascades, and lessons they merely reviewed just lose the reviewer link.
  await prisma.$transaction([
    prisma.lesson.deleteMany({ where: { authorId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);
  revalidatePath("/staff-panel/users");
  revalidatePath("/learn", "layout");
  revalidatePath("/", "layout");
}

export async function resetUserPassword(id: string, formData: FormData) {
  await requireAdmin();
  const password = str(formData, "password");
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  const { hashPassword } = await import("@/lib/learn-auth");
  await prisma.user.update({
    where: { id },
    data: { passwordHash: await hashPassword(password) },
  });
  revalidatePath("/staff-panel/users");
}

export async function updateUserRole(id: string, formData: FormData) {
  await requireAdmin();
  const role = str(formData, "role") as Role;
  const allowedRoles: Role[] = ["ADMIN", "EDITOR", "LECTURER"];
  const safeRole = allowedRoles.includes(role) ? role : "EDITOR";
  await prisma.user.update({
    where: { id },
    data: { role: safeRole },
  });
  revalidatePath("/staff-panel/users");
}

// ------------------------------------------------------------------
// Gallery
// ------------------------------------------------------------------

const galleryImageSchema = z.object({
  src: z.string().min(1, "An image is required."),
  caption: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
});

export async function createGalleryImage(formData: FormData) {
  await requireAuth();
  const parsed = galleryImageSchema.safeParse({
    src: str(formData, "src"),
    caption: opt(formData, "caption") ?? undefined,
    order: Number(formData.get("order") ?? 0),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");
  }
  await prisma.galleryImage.create({ data: parsed.data });
  revalidateAll();
  redirect("/staff-panel/gallery?saved=1");
}

export async function updateGalleryImage(id: string, formData: FormData) {
  await requireAuth();
  const existing = await prisma.galleryImage.findUnique({ where: { id } });
  const parsed = galleryImageSchema.safeParse({
    src: str(formData, "src"),
    caption: opt(formData, "caption") ?? undefined,
    order: Number(formData.get("order") ?? 0),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");
  }
  await prisma.galleryImage.update({
    where: { id },
    data: parsed.data,
  });
  if (existing?.src && parsed.data.src && existing.src !== parsed.data.src) {
    await removeUploadFile(existing.src);
  }
  revalidateAll();
  redirect("/staff-panel/gallery?saved=1");
}

export async function deleteGalleryImage(id: string) {
  await requireAuth();
  const existing = await prisma.galleryImage.findUnique({ where: { id } });
  await prisma.galleryImage.delete({ where: { id } });
  if (existing?.src) await removeUploadFile(existing.src);
  revalidateAll();
}

