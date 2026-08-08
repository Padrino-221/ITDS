import { requireRole } from "@/lib/auth";

export default async function LearnReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["ADMIN"], "/learn/account/signin");
  return <>{children}</>;
}
