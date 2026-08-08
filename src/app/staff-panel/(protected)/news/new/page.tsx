import { NewsForm } from "@/components/admin/forms";
import { AdminPageHeader } from "@/components/admin/ui";

export default function NewNewsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="New Post" description="Create a news or event post." />
      <NewsForm />
    </div>
  );
}
