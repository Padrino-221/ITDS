import { requireRole } from "@/lib/auth";

export default async function LearnAuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["LECTURER", "EDITOR", "ADMIN"], "/learn/account/signin");
  return <>{children}</>;
}
