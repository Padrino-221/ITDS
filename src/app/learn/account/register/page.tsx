import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import { RegisterForm } from "@/components/learn/AuthForms";

export const metadata: Metadata = { title: "Create account — ITDS E-Learning Hub" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6 sm:py-16">
      <div className="rounded-2xl border border-forest-100 bg-white p-8 shadow-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-50">
          <UserPlus className="h-6 w-6 text-gold-600" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-forest-950">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          For learners — free and optional, used only to save your lesson progress.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
