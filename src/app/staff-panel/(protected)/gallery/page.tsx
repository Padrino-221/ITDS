import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  AdminPageHeader,
  DataTable,
  PAGE_SIZE,
  PrimaryLink,
  SecondaryLink,
} from "@/components/admin/ui";
import { SavedToast } from "@/components/admin/SavedToast";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteGalleryImage } from "@/app/staff-panel/actions";

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; page?: string }>;
}) {
  const { saved, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const [images, total] = await Promise.all([
    prisma.galleryImage.findMany({
      select: { id: true, src: true, caption: true, order: true },
      orderBy: { order: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.galleryImage.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gallery"
        description="Photos shown on the Gallery page and homepage carousel."
        action={
          <PrimaryLink href="/staff-panel/gallery/new">
            <Plus className="h-4 w-4" />
            Add Image
          </PrimaryLink>
        }
      />
      <SavedToast saved={saved} />

      <DataTable
        rows={images}
        getKey={(item) => item.id}
        emptyMessage="No gallery images yet. Add your first one."
        pagination={{ page: safePage, totalPages, basePath: "/staff-panel/gallery" }}
        columns={[
          {
            key: "image",
            header: "Image",
            cell: (item) => (
              <Link
                href={`/staff-panel/gallery/${item.id}/edit`}
                className="group flex max-w-xs items-center gap-3"
              >
                <span className="relative block h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-forest-50">
                  <Image
                    src={item.src}
                    alt={item.caption ?? "Gallery image"}
                    fill
                    className="object-cover"
                  />
                </span>
                <span className="line-clamp-1 text-xs text-ink-soft group-hover:text-forest-700">
                  {item.src}
                </span>
              </Link>
            ),
          },
          {
            key: "caption",
            header: "Caption",
            cell: (item) => (
              <span className="font-semibold text-forest-900">
                {item.caption || <span className="font-normal text-ink-soft">—</span>}
              </span>
            ),
          },
          {
            key: "order",
            header: "Order",
            cell: (item) => <span className="text-ink-soft">{item.order}</span>,
          },
          {
            key: "actions",
            header: "Actions",
            align: "right",
            cell: (item) => (
              <div className="flex justify-end gap-2">
                <SecondaryLink href={`/staff-panel/gallery/${item.id}/edit`} size="sm">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </SecondaryLink>
                <DeleteButton action={deleteGalleryImage.bind(null, item.id)} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
