"use client";

import { useConfirm } from "@/components/admin/ConfirmDialog";
import { deleteSpmsUser } from "@/app/spms/(protected)/actions";
import { Trash2 } from "lucide-react";

export default function DeleteUserConfirm({ userId }: { userId: string }) {
  const { confirm } = useConfirm();

  async function handleDelete() {
    const ok = await confirm({
      title: "Delete user?",
      message:
        "This action cannot be undone. The user will be permanently removed from the system.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (ok) {
      const result = await deleteSpmsUser(userId);
      if (result?.error) {
        alert(result.error);
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="inline-flex items-center gap-1 rounded-lg border border-forest-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-50"
    >
      <Trash2 className="h-3 w-3" />
    </button>
  );
}
