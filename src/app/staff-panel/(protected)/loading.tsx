import { AdminPageHeader } from "@/components/admin/ui";

export default function StaffPanelLoading() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Loading…" description="Please wait while your request is processed." />
      <div className="animate-pulse space-y-5">
        <div className="h-32 rounded-xl border border-forest-100 bg-white" />
        <div className="rounded-xl border border-forest-100 bg-white p-6">
          <div className="mb-5 h-5 w-44 rounded-lg bg-stone-200" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded-lg bg-stone-100" />
            <div className="h-4 w-3/4 rounded-lg bg-stone-100" />
            <div className="h-4 w-2/3 rounded-lg bg-stone-100" />
          </div>
        </div>
      </div>
    </div>
  );
}