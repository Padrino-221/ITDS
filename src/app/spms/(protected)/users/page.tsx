import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSpmsAdmin } from "@/lib/spms-auth";
import {
  AdminPageHeader,
  DataTable,
  PrimaryLink,
  SecondaryLink,
} from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import { Pencil } from "lucide-react";
import DeleteUserConfirm from "@/components/spms/DeleteUserConfirm";

export const metadata = { title: "Users" };

export default async function SpmsUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; tempPassword?: string }>;
}) {
  await requireSpmsAdmin();
  const params = await searchParams;

  const users = await prisma.supervisor.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users"
        description={`${users.length} user${users.length !== 1 ? "s" : ""} total`}
        action={
          <PrimaryLink href="/spms/users/new">
            + Add User
          </PrimaryLink>
        }
      />

      <SavedToast saved={params.created} message="User created successfully!" />

      {/* Temp password display */}
      {params.created && params.tempPassword && (
        <div className="rounded-lg border border-forest-200 bg-forest-50 p-4">
          <p className="text-sm font-medium text-forest-800">User created successfully!</p>
          <p className="mt-1 text-sm text-forest-700">
            Temporary password:{" "}
            <code className="rounded bg-forest-100 px-2 py-0.5 font-mono text-sm">
              {decodeURIComponent(params.tempPassword)}
            </code>
          </p>
          <p className="mt-1 text-xs text-forest-600">
            Share this password with the user. They should change it on first login.
          </p>
        </div>
      )}

      {/* Users table */}
      <DataTable
        rows={users}
        getKey={(user) => user.id}
        emptyMessage="No users found."
        columns={[

          {
            key: "name",
            header: "Name",
            cell: (user) => (
              <span className="font-medium text-forest-900">{user.name}</span>
            ),
          },
          {
            key: "email",
            header: "Email",
            cell: (user) => <span className="text-ink-soft">{user.email}</span>,
          },
          {
            key: "role",
            header: "Role",
            cell: (user) => (
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  user.role === "ADMIN"
                    ? "bg-red-50 text-red-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {user.role}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            align: "right",
            cell: (user) => (
              <div className="flex justify-end gap-2">
                <SecondaryLink
                  href={`/spms/users/${user.id}/edit`}
                  size="sm"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </SecondaryLink>
                <DeleteUserConfirm userId={user.id} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
