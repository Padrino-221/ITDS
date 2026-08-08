import { ResearchForm } from "@/components/admin/forms";
import { AdminPageHeader } from "@/components/admin/ui";

export default function NewResearchPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="New Research Area" description="Add a research domain." />
      <ResearchForm />
    </div>
  );
}
