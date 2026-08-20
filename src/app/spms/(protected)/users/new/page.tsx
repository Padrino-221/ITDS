import { requireSpmsAdmin } from "@/lib/spms-auth";
import { createSpmsUserAction } from "../../actions";
import {
  AdminPageHeader,
  AdminCard,
  Field,
  PrimaryButton,
  SecondaryLink,
} from "@/components/admin/ui";
import { Select } from "@/components/admin/Dropdown";

export const metadata = { title: "Add User" };

export default async function NewSpmsUserPage() {
  await requireSpmsAdmin();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Add User"
        description="Create a new account. A secure password will be auto-generated and displayed after creation."
      />

      <AdminCard title="User Details">
        <form action={createSpmsUserAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First Name" required>
              <input
                name="firstName"
                required
                placeholder="Enter first name"
                className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              />
            </Field>
            <Field label="Last Name" required>
              <input
                name="lastName"
                required
                placeholder="Enter last name"
                className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              />
            </Field>
          </div>

          <Field label="Email" required>
            <input
              name="email"
              type="email"
              required
              placeholder="user@uenr.edu.gh"
              className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </Field>

          <Field label="Role" required>
            <Select
              name="role"
              required
              defaultValue="LECTURER"
              options={[
                { value: "LECTURER", label: "Lecturer" },
                { value: "ADMIN", label: "Admin" },
              ]}
            />
          </Field>

          <div className="flex items-center gap-3 border-t border-forest-100 pt-4">
            <PrimaryButton type="submit">
              Generate Password & Create User
            </PrimaryButton>
            <SecondaryLink href="/spms/users">Cancel</SecondaryLink>
          </div>
        </form>
      </AdminCard>
    </div>
  );
}
