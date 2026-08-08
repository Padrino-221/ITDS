import { requireRole } from "@/lib/auth";

export default async function LearnAuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Staff roles only; unauthenticated users go to the Staff Panel sign-in
  // (the learner sign-in on /learn rejects staff accounts).
  await requireRole(["LECTURER", "EDITOR", "ADMIN"], "/staff-panel/login");
  return <>{children}</>;
}
