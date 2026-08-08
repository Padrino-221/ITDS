"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { register, signin } from "@/app/learn/actions";

const inputClass =
  "w-full rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-sm text-forest-950 placeholder:text-ink-soft/60 outline-none transition-all focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
        {label}
      </span>
      {children}
    </label>
  );
}

export function SignInForm() {
  const [state, formAction, pending] = useActionState<{ error?: string }, FormData>(
    signin,
    { error: undefined }
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}
      <Field label="Email">
        <input type="email" name="email" required autoComplete="email" className={inputClass} placeholder="you@uenr.edu.gh" />
      </Field>
      <Field label="Password">
        <input type="password" name="password" required autoComplete="current-password" className={inputClass} placeholder="••••••••" />
      </Field>
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest-950 px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lg disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign in
      </button>
      <p className="text-center text-sm text-ink-soft">
        New here?{" "}
        <Link href="/learn/account/register" className="font-bold text-gold-600 hover:text-gold-700">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<{ error?: string }, FormData>(
    register,
    { error: undefined }
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}
      <Field label="Full name">
        <input type="text" name="name" required autoComplete="name" className={inputClass} placeholder="e.g. Ama Owusu" />
      </Field>
      <Field label="Email">
        <input type="email" name="email" required autoComplete="email" className={inputClass} placeholder="you@uenr.edu.gh" />
      </Field>
      <Field label="Password">
        <input type="password" name="password" required minLength={8} autoComplete="new-password" className={inputClass} placeholder="At least 8 characters" />
      </Field>
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest-950 px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lg disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Create account
      </button>
      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/learn/account/signin" className="font-bold text-gold-600 hover:text-gold-700">
          Sign in
        </Link>
      </p>
    </form>
  );
}
