import { requireRole } from "@/lib/auth";
import { absoluteUrl } from "@/lib/utils";

export default async function LearnAuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Staff roles only — lecturers author lessons, admins/editors may too.
  // Unauthenticated users go to the Staff Panel sign-in (the learner sign-in
  // on /learn only covers learner accounts).
  await requireRole(["LECTURER", "ADMIN"], absoluteUrl("/staff-panel/login"));
  return <>{children}</>;
}