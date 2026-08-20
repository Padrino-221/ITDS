import { requireSpmsAuth } from "@/lib/spms-auth";
import SpmsSidebar from "@/components/spms/Sidebar";

export const metadata = { title: "SPMS" };

export default async function SpmsProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSpmsAuth();

  return (
    <div className="flex h-dvh overflow-hidden bg-stone-100">
      <SpmsSidebar user={user} />
      <div className="scrollbar-hide min-w-0 flex-1 overflow-y-auto">
        <main className="mx-auto max-w-6xl px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-10">
          {children}
        </main>
      </div>
    </div>
  );
}
