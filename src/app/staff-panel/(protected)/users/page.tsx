import { ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import {
  AdminPageHeader,
  DataTable,
  PAGE_SIZE,
  SecondaryButton,
} from "@/components/admin/ui";
import { Select } from "@/components/admin/Dropdown";
import { SavedToast } from "@/components/admin/SavedToast";
import DeleteButton from "@/components/admin/DeleteButton";
import AddUserModal from "@/components/admin/AddUserModal";
import ResetPasswordModal from "@/components/admin/ResetPasswordModal";
import { deleteUser, updateUserRole } from "@/app/staff-panel/actions";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; page?: string }>;
}) {
  const { saved, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const session = await requireAdmin();
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { authoredLessons: true } },
      },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users"
        description="Manage staff accounts that can edit website content. Only administrators can access this page."
        action={<AddUserModal />}
      />
      <SavedToast saved={saved} />

      <DataTable
        rows={users}
        getKey={(user) => user.id}
        emptyMessage="No users yet."
        pagination={{ page: safePage, totalPages, basePath: "/staff-panel/users" }}
        columns={[
          {
            key: "name",
            header: "Name",
            cell: (user) => (
              <div className="flex items-center gap-2.5">
                <span className="font-semibold text-forest-900">{user.name}</span>
                {user.id === session.id && (
                  <span className="rounded-lg bg-forest-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest-700">
                    You
                  </span>
                )}
              </div>
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
              <form action={updateUserRole.bind(null, user.id)} className="flex items-center gap-2">
                <Select
                  name="role"
                  defaultValue={user.role}
                  size="sm"
                  className="w-28"
                  options={[
                    { value: "EDITOR", label: "Editor" },
                    { value: "LECTURER", label: "Lecturer" },
                    { value: "ADMIN", label: "Admin" },
                  ]}
                />
                <SecondaryButton type="submit" size="sm">
                  Save
                </SecondaryButton>
              </form>
            ),
          },
          {
            key: "created",
            header: "Created",
            cell: (user) => <span className="text-ink-soft">{formatDate(user.createdAt)}</span>,
          },
          {
            key: "actions",
            header: "Actions",
            align: "right",
            cell: (user) => (
              <div className="flex justify-end gap-2">
                {user.id !== session.id && (
                  <ResetPasswordModal userId={user.id} userName={user.name} />
                )}
                {user.id !== session.id && (
                  <DeleteButton
                    action={deleteUser.bind(null, user.id)}
                    confirmText={`Remove ${user.name}?${
                      user._count.authoredLessons > 0
                        ? ` This will also delete their ${user._count.authoredLessons} authored lesson${
                            user._count.authoredLessons === 1 ? "" : "s"
                          } from the E-Learning Hub.`
                        : ""
                    } They will no longer be able to sign in.`}
                    label=""
                    className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white p-1.5 text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
                  />
                )}
              </div>
            ),
          },
        ]}
      />

      <p className="flex items-center gap-2 text-xs text-ink-soft">
        <ShieldCheck className="h-4 w-4 text-gold-600" />
        Admin accounts can manage users and all content. Editor accounts can manage all content but not users.
      </p>
    </div>
  );
}
