"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { spmsLogin } from "@/app/spms/(protected)/actions";
import PasswordInput from "@/components/admin/PasswordInput";

export default function SpmsLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const result = await spmsLogin(email, password);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/spms/dashboard");
      router.refresh();
    }
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
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@uenr.edu.gh"
          className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-forest-950 placeholder:text-stone-400 focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-forest-900">
          Password
        </label>
        <PasswordInput
          id="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          inputClassName="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-forest-950 placeholder:text-stone-400 focus:border-forest-500 focus:outline-none focus:ring-1 focus:ring-forest-500"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded border-stone-300 text-forest-600 focus:ring-forest-500"
          />
          Remember me
        </label>
        <Link
          href="/spms/forgot-password"
          className="text-sm text-forest-600 hover:text-forest-800"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
