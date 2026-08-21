"use client";

import { useState } from "react";
import { changeSpmsPassword } from "@/app/spms/(protected)/actions";
import { AdminCard, SaveButton } from "@/components/admin/ui";
import PasswordInput from "@/components/admin/PasswordInput";

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
          <PasswordInput
            id="currentPassword"
            name="currentPassword"
            required
            autoComplete="current-password"
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-forest-900">
            New Password
          </label>
          <PasswordInput
            id="newPassword"
            name="newPassword"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-forest-900">
            Confirm New Password
          </label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            className="mt-1"
          />
        </div>

        <div className="border-t border-forest-100 pt-4">
          <SaveButton pending={saving} />
        </div>
      </form>
    </AdminCard>
  );
}
