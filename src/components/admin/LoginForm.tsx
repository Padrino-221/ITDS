"use client";

import { useActionState } from "react";
import { CircleNotch, Envelope, Lock } from "@phosphor-icons/react";
import { login } from "@/app/staff-panel/actions";
import { Field, PrimaryButton, TextInput } from "./ui";
import PasswordInput from "./PasswordInput";

const initialState = { error: "" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Email address" htmlFor="login-email">
        <TextInput
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@uenr.edu.gh"
          icon={<Envelope weight="duotone" className="h-4 w-4" />}
        />
      </Field>
      <Field label="Password" htmlFor="login-password">
        <PasswordInput
          id="login-password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          icon={<Lock weight="duotone" className="h-4 w-4" />}
        />
      </Field>
      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}
      <PrimaryButton type="submit" pending={pending} className="w-full">
        {pending && <CircleNotch weight="duotone" className="h-4 w-4 animate-spin" />}
        {pending ? "Signing in…" : "Sign In"}
      </PrimaryButton>
    </form>
  );
}
