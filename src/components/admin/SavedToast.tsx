"use client";

import { useEffect, useRef } from "react";
import { useToast } from "./Toast";

/**
 * Fires a success toast when the page was loaded with `?saved=1`
 * (set by server actions after a successful save), then clears the
 * query parameter so a refresh does not re-show the toast.
 */
export function SavedToast({
  saved,
  message = "Changes saved successfully.",
}: {
  saved?: string;
  message?: string;
}) {
  const { toast } = useToast();
  const shown = useRef(false);

  useEffect(() => {
    // Guard against StrictMode double-invoking mount effects in dev.
    if (!saved || shown.current) return;
    shown.current = true;
    toast(message);
    window.history.replaceState(null, "", window.location.pathname);
  }, [saved, message, toast]);

  return null;
}
