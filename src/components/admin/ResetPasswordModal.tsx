"use client";

import { useState } from "react";
import { Key, Pencil, X } from "lucide-react";
import { Field, PrimaryButton } from "@/components/admin/ui";
import PasswordInput from "@/components/admin/PasswordInput";
import { resetUserPassword } from "@/app/staff-panel/actions";
import { useToast } from "./Toast";

export default function ResetPasswordModal({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-lg border border-forest-200 bg-white p-1.5 text-ink-soft transition-colors hover:border-gold-400 hover:text-gold-700"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-forest-100 bg-white p-0 shadow-xl animate-scale-in">
            <form
              action={async (data) => {
                try {
                  await resetUserPassword(userId, data);
                  toast(`Password reset for ${userName}.`);
                  setOpen(false);
                } catch (err) {
                  toast(
                    err instanceof Error ? err.message : "Failed to reset password.",
                    "error"
                  );
                }
              }}
            >
              <div className="flex items-center justify-between border-b border-forest-100 px-6 py-4">
                <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-forest-950">
                  <Key className="h-5 w-5 text-gold-600" />
                  Reset Password
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-forest-50 hover:text-forest-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-6 py-5 text-left">
                <p className="mb-4 text-left text-sm text-ink-soft">
                  Set a new password for <span className="font-semibold text-forest-900">{userName}</span>.
                </p>
                <Field label="New password" required hint="At least 8 characters." className="text-left">
                  <PasswordInput
                    name="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </Field>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-forest-100 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-forest-200 bg-white px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:border-forest-400"
                >
                  Cancel
                </button>
                <PrimaryButton type="submit">
                  <Key className="h-4 w-4" />
                  Reset Password
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
