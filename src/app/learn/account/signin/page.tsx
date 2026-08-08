import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ShieldCheck } from "lucide-react";
import { SignInForm } from "@/components/learn/AuthForms";

export const metadata: Metadata = { title: "Sign in — ITDS E-Learning Hub" };

export default function SignInPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-forest-100 bg-white p-8 shadow-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-50">
          <BookOpen className="h-6 w-6 text-forest-600" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-forest-950">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Sign in as a learner to track your progress across the E-Learning Hub.
        </p>
        <div className="mt-6">
          <SignInForm />
        </div>
        <p className="mt-5 flex items-start gap-2 rounded-xl bg-forest-50 px-4 py-3 text-xs leading-relaxed text-ink-soft">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
          Staff and lecturers — sign in via the{" "}
          <Link
            href="/staff-panel/login"
            className="font-bold text-forest-800 underline underline-offset-2 hover:text-forest-600"
          >
            Staff Panel
          </Link>
        </p>
      </div>
    </div>
  );
}
