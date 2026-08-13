"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Field, PrimaryButton, TextInput } from "@/components/admin/ui";
import { Select } from "@/components/admin/Dropdown";
import PasswordInput from "@/components/admin/PasswordInput";
import { createUser } from "@/app/staff-panel/actions";

export default function AddUserModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-forest-950 px-4 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-forest-800"
      >
        <Plus className="h-4 w-4" />
        Add User
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-forest-100 bg-white p-0 shadow-xl animate-scale-in">
            <form action={createUser} className="max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-forest-100 px-6 py-4">
                <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-forest-950">
                  <Plus className="h-5 w-5 text-gold-600" />
                  Add a User
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-forest-50 hover:text-forest-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
                <Field label="Full name" required>
                  <TextInput name="name" required minLength={2} placeholder="e.g. Ama Owusu" />
                </Field>
                <Field label="Email" required>
                  <TextInput name="email" type="email" required placeholder="user@uenr.edu.gh" />
                </Field>
                <Field label="Password" required hint="At least 8 characters.">
                  <PasswordInput
                    name="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </Field>
                <Field label="Role" required>
                  <Select
                    name="role"
                    defaultValue="EDITOR"
                    options={[
                      { value: "EDITOR", label: "Editor — can manage content" },
                      { value: "LECTURER", label: "Lecturer — can author e-learning lessons" },
                      { value: "ADMIN", label: "Admin — full access" },
                    ]}
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
                  <Plus className="h-4 w-4" />
                  Create User
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
