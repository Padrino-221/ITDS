import { requireRole } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = { title: "Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only staff roles may use the admin panel. Students (who can self-register
  // on /learn) and lecturers must NOT reach content management here.
  const user = await requireRole(["ADMIN", "EDITOR"], "/staff-panel/login");

  return (
    <div className="flex h-dvh overflow-hidden bg-stone-100">
      <AdminSidebar user={user} />
      <div className="scrollbar-hide min-w-0 flex-1 overflow-y-auto">
        <main className="mx-auto max-w-6xl px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-10">
          {children}
        </main>
      </div>
    </div>
  );
}
