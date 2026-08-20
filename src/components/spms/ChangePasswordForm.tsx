"use client";

import { useState } from "react";
import { changeSpmsPassword } from "@/app/spms/(protected)/actions";
import { AdminCard, SaveButton } from "@/components/admin/ui";

export default function ChangePasswordForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const currentPassword = form.get("currentPassword") as string;
    const newPassword = form.get("newPassword") as string;
    const confirmPassword = form.get("confirmPassword") as string;

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      setSaving(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setSaving(false);
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from your current password.");
      setSaving(false);
      return;
    }

    const result = await changeSpmsPassword(currentPassword, newPassword);
    setSaving(false);

    if (result && "error" in result) {
      setError(result.error as string);
    } else {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <AdminCard title="Change Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            Password changed successfully!
          </div>
        )}

        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-forest-900">
            Current Password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 block w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-forest-900">
            New Password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="mt-1 block w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-forest-900">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            className="mt-1 block w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
          />
        </div>

        <div className="border-t border-forest-100 pt-4">
          <SaveButton pending={saving} />
        </div>
      </form>
    </AdminCard>
  );
}
