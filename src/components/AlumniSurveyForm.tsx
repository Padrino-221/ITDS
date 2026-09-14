"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { Loader2, Send } from "lucide-react";
import { submitAlumniSurvey, type SurveyActionState } from "@/app/(site)/alumni-survey/actions";
import { useToast } from "@/components/admin/Toast";

const initialState: SurveyActionState = { ok: false, message: "" };

const inputClasses =
  "w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20";

const labelClasses = "mb-1.5 block text-sm font-medium text-ink";

const employmentOptions = [
  "Employed (full-time)",
  "Employed (part-time)",
  "Self-employed / Entrepreneur",
  "Further studies",
  "Seeking employment",
  "Other",
];

const ratingOptions = [
  { value: "5", label: "5 — Excellent" },
  { value: "4", label: "4 — Very good" },
  { value: "3", label: "3 — Good" },
  { value: "2", label: "2 — Fair" },
  { value: "1", label: "1 — Poor" },
];

export default function AlumniSurveyForm({ programmes }: { programmes: string[] }) {
  const [state, formAction, pending] = useActionState(submitAlumniSurvey, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.message) return;
    toast(state.message, state.ok ? "success" : "error");
    if (state.ok) formRef.current?.reset();
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="space-y-8">
      {/* About you */}
      <fieldset className="space-y-4">
        <legend className="font-display text-lg font-extrabold text-forest-950">
          About you
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="fullName" className={labelClasses}>
              Full name <span className="text-gold-600">*</span>
            </label>
            <input id="fullName" name="fullName" required placeholder="Your full name" className={inputClasses} />
          </div>
          <div>
            <label htmlFor="email" className={labelClasses}>
              Email address <span className="text-gold-600">*</span>
            </label>
            <input id="email" name="email" type="email" required placeholder="you@example.com" className={inputClasses} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className={labelClasses}>
              Phone number
            </label>
            <input id="phone" name="phone" placeholder="+233…" className={inputClasses} />
          </div>
          <div>
            <label htmlFor="graduationYear" className={labelClasses}>
              Year of graduation <span className="text-gold-600">*</span>
            </label>
            <input
              id="graduationYear"
              name="graduationYear"
              required
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              placeholder="e.g. 2023"
              className={inputClasses}
            />
          </div>
        </div>
      </fieldset>

      {/* Programme & career */}
      <fieldset className="space-y-4 border-t border-forest-100 pt-8">
        <legend className="font-display text-lg font-extrabold text-forest-950">
          Programme &amp; career
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="programme" className={labelClasses}>
              Programme completed <span className="text-gold-600">*</span>
            </label>
            <select id="programme" name="programme" required defaultValue="" className={inputClasses}>
              <option value="" disabled>
                Select programme…
              </option>
              {programmes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="employmentStatus" className={labelClasses}>
              Current status <span className="text-gold-600">*</span>
            </label>
            <select id="employmentStatus" name="employmentStatus" required defaultValue="" className={inputClasses}>
              <option value="" disabled>
                Select status…
              </option>
              {employmentOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="employer" className={labelClasses}>
              Employer / organisation
            </label>
            <input id="employer" name="employer" placeholder="Where do you work?" className={inputClasses} />
          </div>
          <div>
            <label htmlFor="jobTitle" className={labelClasses}>
              Job title / role
            </label>
            <input id="jobTitle" name="jobTitle" placeholder="e.g. Software Engineer" className={inputClasses} />
          </div>
        </div>
        <div>
          <label htmlFor="industry" className={labelClasses}>
            Industry
          </label>
          <input id="industry" name="industry" placeholder="e.g. Banking, Telecom, Education" className={inputClasses} />
        </div>
      </fieldset>

      {/* Feedback */}
      <fieldset className="space-y-4 border-t border-forest-100 pt-8">
        <legend className="font-display text-lg font-extrabold text-forest-950">
          Your feedback
        </legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="preparationRating" className={labelClasses}>
              How well did your programme prepare you for your career?{" "}
              <span className="text-gold-600">*</span>
            </label>
            <select id="preparationRating" name="preparationRating" required defaultValue="" className={inputClasses}>
              <option value="" disabled>
                Rate…
              </option>
              {ratingOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="curriculumRating" className={labelClasses}>
              How would you rate the curriculum? <span className="text-gold-600">*</span>
            </label>
            <select id="curriculumRating" name="curriculumRating" required defaultValue="" className={inputClasses}>
              <option value="" disabled>
                Rate…
              </option>
              {ratingOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="recommendRating" className={labelClasses}>
              Would you recommend ITDS to prospective students?{" "}
              <span className="text-gold-600">*</span>
            </label>
            <select id="recommendRating" name="recommendRating" required defaultValue="" className={inputClasses}>
              <option value="" disabled>
                Rate…
              </option>
              {ratingOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="skillsFeedback" className={labelClasses}>
            Which skills or topics should the department emphasise more?
          </label>
          <textarea
            id="skillsFeedback"
            name="skillsFeedback"
            rows={3}
            placeholder="Share any skills, tools or courses you wish had more focus…"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="feedback" className={labelClasses}>
            Any other feedback or suggestions?
          </label>
          <textarea
            id="feedback"
            name="feedback"
            rows={5}
            placeholder="Tell us how we can improve…"
            className={inputClasses}
          />
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-forest-100 bg-forest-50/40 p-4 text-sm text-ink">
          <input
            type="checkbox"
            name="willingToMentor"
            className="mt-0.5 h-4 w-4 rounded border-forest-300 accent-forest-700"
          />
          <span>
            I am willing to mentor current students or speak at department events.
          </span>
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="btn-pill bg-forest-800 px-7 py-3 text-white hover:-translate-y-0.5 hover:bg-forest-700 disabled:translate-y-0 disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {pending ? "Submitting…" : "Submit Survey"}
      </button>
    </form>
  );
}
