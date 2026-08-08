import { requireRole } from "@/lib/auth";

export default async function LearnReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["ADMIN"], "/staff-panel/login");
  return <>{children}</>;
}
