import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { SignInForm } from "@/components/learn/AuthForms";

export const metadata: Metadata = { title: "Sign in — ITDS Learning Hub" };

export default function SignInPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-forest-100 bg-white p-8 shadow-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-50">
          <BookOpen className="h-6 w-6 text-gold-600" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-forest-950">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Sign in to track your progress across the Learning Hub.
        </p>
        <div className="mt-6">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
