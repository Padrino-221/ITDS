import { requireRole } from "@/lib/auth";
import { absoluteUrl } from "@/lib/utils";

export default async function LearnManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["ADMIN"], absoluteUrl("/staff-panel/login"));
  return <>{children}</>;
}
