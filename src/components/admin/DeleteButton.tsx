"use client";

import { useTransition } from "react";
import { Trash } from "@phosphor-icons/react";
import { useConfirm } from "./ConfirmDialog";
import { useToast } from "./Toast";

export default function DeleteButton({
  action,
  confirmText = "Are you sure you want to delete this item? This cannot be undone.",
  label = "Delete",
  className,
  onSuccess,
}: {
  action: () => Promise<void>;
  confirmText?: string;
  label?: string;
  className?: string;
  onSuccess?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const handleClick = async () => {
    const ok = await confirm({
      title: "Delete Item",
      message: confirmText,
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    startTransition(async () => {
      try {
        await action();
        toast("Item deleted successfully.");
        onSuccess?.();
      } catch {
        toast("Failed to delete item.", "error");
      }
    });
  };

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
      }
    >
      <Trash weight="duotone" className="h-3.5 w-3.5" />
      {pending ? "Deleting…" : label}
    </button>
  );
}
