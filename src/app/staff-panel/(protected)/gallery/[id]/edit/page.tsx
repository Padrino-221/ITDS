import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GalleryImageForm } from "@/components/admin/forms";
import { AdminPageHeader } from "@/components/admin/ui";

export default async function EditGalleryImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const image = await prisma.galleryImage.findUnique({ where: { id } });
  if (!image) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edit Gallery Image"
        description={image.caption ?? undefined}
      />
      <GalleryImageForm image={image} />
    </div>
  );
}