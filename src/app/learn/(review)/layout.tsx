import { requireRole } from "@/lib/auth";
import { learnUrl } from "@/lib/utils";

export default async function LearnReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["ADMIN"], learnUrl("/account/signin"));
  return <>{children}</>;
}
