import { requireAuth } from "@/lib/auth";

export default async function LearnAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("/learn/account/signin");
  return <>{children}</>;
}
