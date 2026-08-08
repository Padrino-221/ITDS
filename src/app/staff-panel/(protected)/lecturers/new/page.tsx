import { LecturerForm } from "@/components/admin/forms";
import { AdminPageHeader } from "@/components/admin/ui";

export default function NewLecturerPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="New Lecturer" description="Add a faculty profile." />
      <LecturerForm />
    </div>
  );
}
