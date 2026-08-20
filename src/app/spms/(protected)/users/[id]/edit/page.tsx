import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSpmsAdmin } from "@/lib/spms-auth";
import { updateSpmsUser } from "../../../actions";
import {
  AdminPageHeader,
  AdminCard,
  Field,
  PrimaryButton,
  SecondaryLink,
} from "@/components/admin/ui";
import { Select } from "@/components/admin/Dropdown";

export const metadata = { title: "Edit User" };

export default async function EditSpmsUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSpmsAdmin();
  const { id } = await params;

  const user = await prisma.supervisor.findUnique({ where: { id } });
  if (!user) notFound();

  const nameParts = user.name.split(" ");
  const firstName = nameParts.slice(0, -1).join(" ") || nameParts[0] || "";
  const lastName = nameParts.slice(-1)[0] || "";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edit User"
        description="Update user details."
      />

      <AdminCard title="User Details">
        <form action={updateSpmsUser.bind(null, id)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First Name" required>
              <input
                name="firstName"
                required
                defaultValue={firstName}
                className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              />
            </Field>
            <Field label="Last Name" required>
              <input
                name="lastName"
                required
                defaultValue={lastName}
                className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              />
            </Field>
          </div>

          <Field label="Email" required>
            <input
              name="email"
              type="email"
              required
              defaultValue={user.email}
              className="w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20"
            />
          </Field>

          <Field label="Role" required>
            <Select
              name="role"
              required
              defaultValue={user.role}
              options={[
                { value: "LECTURER", label: "Lecturer" },
                { value: "ADMIN", label: "Admin" },
              ]}
            />
          </Field>

          <div className="flex items-center gap-3 border-t border-forest-100 pt-4">
            <PrimaryButton type="submit">Update User</PrimaryButton>
            <SecondaryLink href="/spms/users">Cancel</SecondaryLink>
          </div>
        </form>
      </AdminCard>
    </div>
  );
}
