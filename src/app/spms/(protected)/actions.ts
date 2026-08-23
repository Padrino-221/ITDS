"use server";

import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import {
  authenticateSpms,
  createSpmsSession,
  destroySpmsSession,
  hashPassword,
  verifyPassword,
  requireSpmsAdmin,
  getSpmsSession,
  type SpmsSessionUser,
} from "@/lib/spms-auth";
import { removeUploadFile } from "@/lib/uploads";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { slugify } from "@/lib/utils";
import { str, opt } from "@/lib/form-utils";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function spmsLogin(email: string, password: string) {
  const user = await authenticateSpms(email, password);
  if (!user) {
    return { error: "Invalid email or password." };
  }
  await createSpmsSession(user);
  return { success: true };
}

export async function spmsLogout() {
  await destroySpmsSession();
  redirect("/spms/login");
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

type ProfileData = {
  userTitle?: string;
  gender?: string;
  name?: string;
  jobRank?: string;
  phone?: string;
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  publink?: string;
  researchArea1?: string;
  researchArea2?: string;
  profilePhoto?: string;
  about?: string;
};

export async function updateSpmsProfile(data: ProfileData) {
  const session = await getSpmsSession();
  if (!session) redirect("/spms/login");

  // Convert empty strings to null so we don't overwrite existing data
  const emptyToNull = (v: string | undefined) => (v ? v : null);

  const supervisorUpdate: Record<string, any> = {};
  if (data.userTitle !== undefined) supervisorUpdate.userTitle = emptyToNull(data.userTitle);
  if (data.gender !== undefined) supervisorUpdate.gender = emptyToNull(data.gender);
  if (data.name !== undefined) supervisorUpdate.name = data.name || null;
  if (data.jobRank !== undefined) supervisorUpdate.jobRank = emptyToNull(data.jobRank);
  if (data.phone !== undefined) supervisorUpdate.phone = emptyToNull(data.phone);
  if (data.linkedin !== undefined) supervisorUpdate.linkedin = emptyToNull(data.linkedin);
  if (data.facebook !== undefined) supervisorUpdate.facebook = emptyToNull(data.facebook);
  if (data.twitter !== undefined) supervisorUpdate.twitter = emptyToNull(data.twitter);
  if (data.publink !== undefined) supervisorUpdate.publink = emptyToNull(data.publink);
  if (data.researchArea1 !== undefined) supervisorUpdate.researchArea1 = emptyToNull(data.researchArea1);
  if (data.researchArea2 !== undefined) supervisorUpdate.researchArea2 = emptyToNull(data.researchArea2);
  if (data.profilePhoto !== undefined) supervisorUpdate.profilePhoto = emptyToNull(data.profilePhoto);
  if (data.about !== undefined) supervisorUpdate.about = emptyToNull(data.about);

  const existing = await prisma.supervisor.findUnique({
    where: { id: session.id },
    select: { name: true, slug: true },
  });

  // Regenerate the public slug from the supervisor's name when it changes,
  // so /lecturers/[slug] URLs stay derived from the name.
  if (data.name && data.name !== existing?.name) {
    const base = slugify(data.name);
    const current = existing?.slug;
    if (base !== current || !current) {
      supervisorUpdate.slug = await uniqueSupervisorSlug(base, session.id);
    }
  }

  await prisma.supervisor.update({
    where: { id: session.id },
    data: supervisorUpdate,
  });

  revalidatePath("/spms/profile");
  revalidatePath("/spms/dashboard");
  revalidatePath("/lecturers", "layout");
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

/** Slug from a supervisor name, deduplicated against other supervisors. */
async function uniqueSupervisorSlug(base: string, excludeId?: string): Promise<string> {
  const baseSlug = slugify(base) || `lecturer-${Date.now()}`;
  let candidate = baseSlug;
  let n = 2;
  while (true) {
    const where = excludeId ? { slug: candidate, id: { not: excludeId } } : { slug: candidate };
    const existing = await prisma.supervisor.findFirst({ where, select: { id: true } });
    if (!existing) return candidate;
    candidate = `${baseSlug}-${n++}`;
  }
}

async function uniqueProjectSlug(base: string): Promise<string> {
  const baseSlug = slugify(base) || `project-${Date.now()}`;
  let candidate = baseSlug;
  let n = 2;
  while (await prisma.project.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${baseSlug}-${n++}`;
  }
  return candidate;
}

export async function createSpmsProject(formData: FormData) {
  const session = await getSpmsSession();
  if (!session) redirect("/spms/login");

  const title = str(formData, "title");
  const abstract = opt(formData, "abstract");
  const studentName = opt(formData, "studentName");
  const program = opt(formData, "program");
  const degreeLevel = opt(formData, "degreeLevel");
  const academicYear = opt(formData, "academicYear");
  const objective = opt(formData, "objective");
  const groupMembers = opt(formData, "groupMembers");
  const githubLink = opt(formData, "githubLink");
  const documentUrl = opt(formData, "documentUrl");
  const documentName = opt(formData, "documentName");

  const slug = await uniqueProjectSlug(title);

  await prisma.project.create({
    data: {
      title,
      slug,
      abstract,
      studentName,
      program,
      degreeLevel: (degreeLevel as any) || "UNDERGRADUATE",
      academicYear,
      supervisorId: session.id,
      objective,
      groupMembers,
      githubLink,
      documentUrl,
      documentName,
      published: true,
    },
  });

  redirect("/spms/projects?created=1");
}

export async function updateSpmsProject(id: string, formData: FormData) {
  const session = await getSpmsSession();
  if (!session) redirect("/spms/login");

  // Admins can edit any project; lecturers can only edit their own
  if (session.role !== "ADMIN") {
    const existing = await prisma.project.findUnique({ where: { id }, select: { supervisorId: true } });
    if (!existing || existing.supervisorId !== session.id) {
      return { error: "You can only edit your own projects." };
    }
  }

  const title = str(formData, "title");
  const abstract = opt(formData, "abstract");
  const studentName = opt(formData, "studentName");
  const program = opt(formData, "program");
  const degreeLevel = opt(formData, "degreeLevel");
  const academicYear = opt(formData, "academicYear");
  const objective = opt(formData, "objective");
  const groupMembers = opt(formData, "groupMembers");
  const githubLink = opt(formData, "githubLink");
  const documentUrl = opt(formData, "documentUrl");
  const documentName = opt(formData, "documentName");

  // Clean up old document file when replaced
  const current = await prisma.project.findUnique({ where: { id }, select: { documentUrl: true } });
  if (current?.documentUrl && documentUrl && current.documentUrl !== documentUrl) {
    await removeUploadFile(current.documentUrl);
  }

  await prisma.project.update({
    where: { id },
    data: {
      title,
      abstract,
      studentName,
      program,
      degreeLevel: (degreeLevel as any) || "UNDERGRADUATE",
      academicYear,
      objective,
      groupMembers,
      githubLink,
      ...(documentUrl && { documentUrl }),
      ...(documentName && { documentName }),
    },
  });

  redirect("/spms/projects?updated=1");
}

export async function deleteSpmsProject(id: string) {
  const session = await getSpmsSession();
  if (!session) redirect("/spms/login");

  // Admins can delete any project; lecturers can only delete their own
  if (session.role !== "ADMIN") {
    const project = await prisma.project.findUnique({ where: { id }, select: { supervisorId: true } });
    if (!project || project.supervisorId !== session.id) {
      return { error: "You can only delete your own projects." };
    }
  }

  // Clean up the associated document file before deleting the record
  const project = await prisma.project.findUnique({ where: { id }, select: { documentUrl: true } });
  if (project?.documentUrl) {
    await removeUploadFile(project.documentUrl);
  }

  await prisma.project.delete({ where: { id } });
  revalidatePath("/spms/projects");
}

// ---------------------------------------------------------------------------
// Users (Admin) — Supervisor accounts
// ---------------------------------------------------------------------------

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(12);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("");
}

export async function createSpmsUser(formData: FormData) {
  await requireSpmsAdmin();

  const name = `${formData.get("firstName") as string} ${formData.get("lastName") as string}`;
  const email = (formData.get("email") as string).toLowerCase().trim();
  const role = formData.get("role") as "ADMIN" | "LECTURER";

  const password = generatePassword();
  const passwordHash = await hashPassword(password);

  const existing = await prisma.supervisor.findUnique({ where: { email } });
  if (existing) {
    return { error: "A user with this email already exists." };
  }

  await prisma.supervisor.create({
    data: { name, email, passwordHash, role, slug: await uniqueSupervisorSlug(name) },
  });

  // Send welcome email via Resend with credentials
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: process.env.RESEND_EMAIL_FROM ?? "ITDS SPMS <onboarding@resend.dev>",
        to: email,
        subject: "Your ITDS SPMS Account Has Been Created",
        html: `<div style="font-family:Arial,Helvetica,sans-serif;background-color:#f4f6fb;padding:32px 16px">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e7f0">
    <h1 style="margin:0 0 12px;font-size:20px;color:#0d3b2e">Welcome to ITDS SPMS</h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#5a6a8a">
      An account has been created for you on the <strong>Student Project Management System</strong>.
      Below are your login credentials:
    </p>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:16px;border:1px solid #e5e7eb">
      <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600">Email</p>
      <p style="margin:0 0 12px;font-size:14px;color:#1a1a2e;font-family:monospace">${email}</p>
      <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600">Password</p>
      <p style="margin:0;font-size:14px;color:#1a1a2e;font-family:monospace">${password}</p>
    </div>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#5a6a8a">
      <strong>Important:</strong> Please change your password after your first login for security.
    </p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://itdsuenr.com"}/spms/login" style="display:inline-block;background-color:#0d3b2e;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Sign In to SPMS</a>
    <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#9aa7c2">
      If you received this email by mistake, please ignore it or contact the department administrator.
    </p>
  </div>
</div>`,
      });
      if (error) {
        console.error("Failed to send SPMS welcome email:", error);
      }
    } catch (err) {
      console.error("Failed to send SPMS welcome email:", err);
    }
  }

  redirect(`/spms/users?created=1&tempPassword=${encodeURIComponent(password)}`);
}

export async function createSpmsUserAction(formData: FormData) {
  await createSpmsUser(formData);
}

export async function updateSpmsUser(id: string, formData: FormData) {
  await requireSpmsAdmin();

  const name = `${formData.get("firstName") as string} ${formData.get("lastName") as string}`;
  const email = (formData.get("email") as string).toLowerCase().trim();
  const role = formData.get("role") as "ADMIN" | "LECTURER";

  await prisma.supervisor.update({
    where: { id },
    data: { name, email, role, slug: await uniqueSupervisorSlug(name, id) },
  });

  redirect("/spms/users?updated=1");
}

export async function deleteSpmsUser(id: string) {
  const session = await requireSpmsAdmin();

  // Don't allow deleting yourself
  if (session.id === id) {
    return { error: "You cannot delete your own account." };
  }

  await prisma.supervisor.delete({ where: { id } });
  revalidatePath("/spms/users");
}

// ---------------------------------------------------------------------------
// Settings (Admin) — Academic Years, Research Areas
// ---------------------------------------------------------------------------

export async function createAcademicYear(name: string) {
  await requireSpmsAdmin();
  await prisma.setting.upsert({
    where: { key: `spms_year_${name}` },
    update: { value: name },
    create: { key: `spms_year_${name}`, value: name },
  });
  revalidatePath("/spms/settings");
}

export async function createAcademicYearAction(formData: FormData) {
  const name = formData.get("name") as string;
  if (name) await createAcademicYear(name);
}

export async function deleteAcademicYear(key: string) {
  await requireSpmsAdmin();
  await prisma.setting.delete({ where: { key } });
  revalidatePath("/spms/settings");
}

// ---------------------------------------------------------------------------
// Settings (Admin) — Research Areas
// ---------------------------------------------------------------------------

export async function createSpmsResearchAreaAction(formData: FormData) {
  await requireSpmsAdmin();

  const title = ((formData.get("title") as string) ?? "").trim();
  if (!title) return;
  const description = ((formData.get("description") as string) ?? "").trim();

  const base = slugify(title) || `area-${Date.now()}`;
  let slug = base;
  let n = 2;
  while (await prisma.researchArea.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${n++}`;
  }

  const max = await prisma.researchArea.aggregate({ _max: { order: true } });
  await prisma.researchArea.create({
    data: { title, slug, description, order: (max._max.order ?? 0) + 1 },
  });

  revalidatePath("/spms/settings");
  revalidatePath("/research");
}

export async function updateSpmsResearchArea(id: string, formData: FormData) {
  await requireSpmsAdmin();

  const title = ((formData.get("title") as string) ?? "").trim();
  if (!title) return;
  const description = ((formData.get("description") as string) ?? "").trim();

  const existing = await prisma.researchArea.findUnique({
    where: { id },
    select: { title: true },
  });
  if (!existing) return;

  // Regenerate the public slug when the title changes.
  const data: { title: string; description: string; slug?: string } = { title, description };
  if (title !== existing.title) {
    const base = slugify(title) || `area-${Date.now()}`;
    let slug = base;
    let n = 2;
    while (await prisma.researchArea.findFirst({
      where: { slug, id: { not: id } },
      select: { id: true },
    })) {
      slug = `${base}-${n++}`;
    }
    data.slug = slug;
  }

  await prisma.researchArea.update({ where: { id }, data });

  revalidatePath("/spms/settings");
  revalidatePath("/research");
}

export async function deleteSpmsResearchArea(id: string) {
  await requireSpmsAdmin();
  await prisma.researchArea.delete({ where: { id } });
  revalidatePath("/spms/settings");
  revalidatePath("/research");
}

// ---------------------------------------------------------------------------
// Forgot Password
// ---------------------------------------------------------------------------

export async function requestSpmsPasswordReset(email: string) {
  const supervisor = await prisma.supervisor.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  // Always return success to prevent email enumeration
  if (!supervisor) return { success: true };

  // Generate a random token
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Invalidate any existing unused tokens for this supervisor
  await prisma.supervisorPasswordReset.updateMany({
    where: { supervisorId: supervisor.id, used: false },
    data: { used: true },
  });

  // Create the new token
  await prisma.supervisorPasswordReset.create({
    data: { supervisorId: supervisor.id, token, expiresAt },
  });

  // Send the reset email via Resend
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://itdsuenr.com";
      const resetUrl = `${siteUrl}/spms/reset-password/${token}`;

      await resend.emails.send({
        from: process.env.RESEND_EMAIL_FROM ?? "ITDS SPMS <onboarding@resend.dev>",
        to: supervisor.email,
        subject: "Reset Your SPMS Password",
        html: `<div style="font-family:Arial,Helvetica,sans-serif;background-color:#f4f6fb;padding:32px 16px">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e7f0">
    <h1 style="margin:0 0 12px;font-size:20px;color:#0d3b2e">Password Reset Request</h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#5a6a8a">
      Hi ${supervisor.name}, we received a request to reset your password for the <strong>Student Project Management System</strong>.
    </p>
    <a href="${resetUrl}" style="display:inline-block;background-color:#0d3b2e;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Reset Password</a>
    <p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#5a6a8a">
      This link will expire in <strong>1 hour</strong>. If you didn&apos;t request a password reset, you can safely ignore this email.
    </p>
    <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#9aa7c2">
      If the button doesn&apos;t work, copy and paste this URL into your browser:<br/>
      <span style="word-break:break-all;color:#6b7280">${resetUrl}</span>
    </p>
  </div>
</div>`,
      });
    } catch (err) {
      console.error("Failed to send SPMS password reset email:", err);
    }
  }

  return { success: true };
}

export async function resetSpmsPassword(token: string, newPassword: string) {
  const resetRecord = await prisma.supervisorPasswordReset.findUnique({
    where: { token },
    include: { supervisor: true },
  });

  if (!resetRecord) {
    return { error: "Invalid or expired reset link." };
  }
  if (resetRecord.used) {
    return { error: "This reset link has already been used." };
  }
  if (new Date() > resetRecord.expiresAt) {
    return { error: "This reset link has expired. Please request a new one." };
  }

  // Hash the new password
  const newHash = await hashPassword(newPassword);

  // Update the supervisor's password and mark the token as used
  await prisma.$transaction([
    prisma.supervisor.update({
      where: { id: resetRecord.supervisorId },
      data: { passwordHash: newHash },
    }),
    prisma.supervisorPasswordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    }),
  ]);

  return { success: true };
}

export async function requestSpmsPasswordResetAction(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return { error: "Please enter your email address." };
  return requestSpmsPasswordReset(email);
}

// ---------------------------------------------------------------------------
// Password change
// ---------------------------------------------------------------------------

export async function changeSpmsPassword(
  currentPassword: string,
  newPassword: string
) {
  const session = await getSpmsSession();
  if (!session) redirect("/spms/login");

  const supervisor = await prisma.supervisor.findUnique({
    where: { id: session.id },
  });
  if (!supervisor) redirect("/spms/login");

  const ok = await verifyPassword(currentPassword, supervisor.passwordHash);
  if (!ok) {
    return { error: "Current password is incorrect." };
  }

  const newHash = await hashPassword(newPassword);

  await prisma.supervisor.update({
    where: { id: session.id },
    data: { passwordHash: newHash },
  });

  return { success: true };
}
