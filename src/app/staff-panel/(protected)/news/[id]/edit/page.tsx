import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewsForm } from "@/components/admin/forms";
import { AdminPageHeader } from "@/components/admin/ui";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Edit Post" description={post.title} />
      <NewsForm post={post} />
    </div>
  );
}
