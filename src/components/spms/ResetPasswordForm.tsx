"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetSpmsPassword } from "@/app/spms/(protected)/actions";
import PasswordInput from "@/components/admin/PasswordInput";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirmPassword = form.get("confirmPassword") as string;

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const result = await resetSpmsPassword(token, password);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/spms/login"), 3000);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-center">
        <p className="text-sm font-semibold text-green-800">Password reset successfully!</p>
        <p className="mt-1 text-sm text-green-700">
          Redirecting to login in 3 seconds…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-forest-900">
          New Password
        </label>
        <PasswordInput
          id="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          inputClassName="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-forest-950 placeholder:text-stone-400 focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-forest-900">
          Confirm Password
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Re-enter your password"
          inputClassName="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-forest-950 placeholder:text-stone-400 focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:opacity-50"
      >
        {loading ? "Resetting…" : "Reset Password"}
      </button>
    </form>
  );
}
