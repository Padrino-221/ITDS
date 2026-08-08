import Image from "next/image";
import { PageHeader, EmptyState } from "@/components/ui";
import { getGallery } from "@/lib/data";

export const metadata = { title: "Department Gallery" };

export default async function GalleryPage() {
  const gallery = await getGallery();

  return (
    <>
      <PageHeader
        title="Department Gallery"
        subtitle="Moments from campus life, classrooms and the UENR Tech Fair."
        crumbs={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {gallery.length === 0 ? (
          <EmptyState
            title="No images yet"
            description="Gallery images will appear here once added."
          />
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {gallery.map((item) => (
              <figure
                key={item.id}
                className="group relative mb-5 overflow-hidden rounded-xl"
              >
                <Image
                  src={item.src}
                  alt={item.caption ?? "Gallery image"}
                  width={800}
                  height={600}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {item.caption && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/85 to-transparent p-4 pt-12">
                    <span className="text-sm font-medium text-white">{item.caption}</span>
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
