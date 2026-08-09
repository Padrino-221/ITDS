import { GalleryImageForm } from "@/components/admin/forms";
import { AdminPageHeader } from "@/components/admin/ui";

export default function NewGalleryImagePage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Add Gallery Image"
        description="Upload a photo to show on the gallery."
      />
      <GalleryImageForm />
    </div>
  );
}