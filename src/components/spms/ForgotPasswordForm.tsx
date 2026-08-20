"use client";

import { useState } from "react";
import { requestSpmsPasswordResetAction } from "@/app/spms/(protected)/actions";

export default function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;

    const fd = new FormData();
    fd.set("email", email);
    const result = await requestSpmsPasswordResetAction(fd);
    setLoading(false);

    if (result && "error" in result) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-center">
        <p className="text-sm font-semibold text-green-800">Check your email</p>
        <p className="mt-1 text-sm text-green-700">
          If an account exists with that email, we&apos;ve sent a password reset link.
          Check your inbox and follow the instructions.
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
        <label htmlFor="email" className="block text-sm font-medium text-forest-900">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@uenr.edu.gh"
          className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-forest-950 placeholder:text-stone-400 focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send Reset Link"}
      </button>
    </form>
  );
}
