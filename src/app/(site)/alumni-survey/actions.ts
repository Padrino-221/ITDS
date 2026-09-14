"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

export type SurveyActionState = { ok: boolean; message: string };

const rating = z.coerce
  .number()
  .int("Please choose a rating.")
  .min(1, "Please choose a rating.")
  .max(5, "Please choose a rating.");

const surveySchema = z.object({
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  graduationYear: z
    .string()
    .regex(/^\d{4}$/, "Enter the year you graduated, e.g. 2023."),
  programme: z.string().min(2, "Please select the programme you graduated from."),
  employmentStatus: z.string().min(2, "Please select your current status."),
  employer: z.string().optional(),
  jobTitle: z.string().optional(),
  industry: z.string().optional(),
  preparationRating: rating,
  curriculumRating: rating,
  recommendRating: rating,
  skillsFeedback: z.string().optional(),
  feedback: z.string().optional(),
  willingToMentor: z.boolean(),
});

export async function submitAlumniSurvey(
  _prev: SurveyActionState,
  formData: FormData
): Promise<SurveyActionState> {
  const parsed = surveySchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    graduationYear: formData.get("graduationYear"),
    programme: formData.get("programme"),
    employmentStatus: formData.get("employmentStatus"),
    employer: formData.get("employer") || undefined,
    jobTitle: formData.get("jobTitle") || undefined,
    industry: formData.get("industry") || undefined,
    preparationRating: formData.get("preparationRating"),
    curriculumRating: formData.get("curriculumRating"),
    recommendRating: formData.get("recommendRating"),
    skillsFeedback: formData.get("skillsFeedback") || undefined,
    feedback: formData.get("feedback") || undefined,
    willingToMentor: formData.get("willingToMentor") === "on",
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.alumniSurveyResponse.create({
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone ?? null,
      graduationYear: parsed.data.graduationYear,
      programme: parsed.data.programme,
      employmentStatus: parsed.data.employmentStatus,
      employer: parsed.data.employer ?? null,
      jobTitle: parsed.data.jobTitle ?? null,
      industry: parsed.data.industry ?? null,
      preparationRating: parsed.data.preparationRating,
      curriculumRating: parsed.data.curriculumRating,
      recommendRating: parsed.data.recommendRating,
      skillsFeedback: parsed.data.skillsFeedback ?? null,
      feedback: parsed.data.feedback ?? null,
      willingToMentor: parsed.data.willingToMentor,
    },
  });

  return {
    ok: true,
    message:
      "Thank you! Your response has been recorded. Your feedback helps us strengthen our programmes.",
  };
}
