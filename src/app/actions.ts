"use server";

import { z } from "zod";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export type ActionState = { ok: boolean; message: string };

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export async function subscribeNewsletter(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = subscribeSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const email = parsed.data.email.toLowerCase();
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  // Send a welcome email when Resend is configured. Failure to deliver the
  // email never blocks the subscription itself.
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: process.env.RESEND_EMAIL_FROM ?? "ITDS Newsletter <onboarding@resend.dev>",
        to: email,
        subject: "Welcome to the ITDS Newsletter",
        html: `<div style="font-family:Arial,Helvetica,sans-serif;background-color:#f4f6fb;padding:32px 16px">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e7f0">
    <h1 style="margin:0 0 12px;font-size:20px;color:#0d2358">Welcome to the ITDS Newsletter!</h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#5a6a8a">
      Thank you for subscribing. You will receive the latest news, research
      breakthroughs, and opportunities from the Department of Information
      Technology and Decision Sciences at UENR.
    </p>
    <p style="margin:0;font-size:12px;line-height:1.5;color:#9aa7c2">
      If you received this email by mistake, you can simply ignore it.
    </p>
  </div>
</div>`,
      });
      if (error) {
        console.error("Failed to send newsletter welcome email:", error);
      }
    } catch (err) {
      console.error("Failed to send newsletter welcome email:", err);
    }
  }

  return { ok: true, message: "Thank you for subscribing to our newsletter!" };
}

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(3, "Please enter a subject."),
  message: z.string().min(10, "Your message should be at least 10 characters."),
});

export async function submitContact(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.contactMessage.create({
    data: { ...parsed.data },
  });

  return {
    ok: true,
    message:
      "Thank you! Your message has been sent to the department. We will get back to you soon.",
  };
}
