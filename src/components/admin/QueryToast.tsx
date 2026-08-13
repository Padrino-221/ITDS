"use client";

import { useEffect, useRef } from "react";
import { useToast } from "./Toast";

/**
 * Fires a toast when the page was loaded with a matching query parameter,
 * then clears the query parameter so a refresh does not re-show the toast.
 *
 * Pass `messages` as a map of query-param values to toast messages.
 * If only one message is needed, use the `message` shorthand instead.
 */
export function QueryToast({
  param,
  messages,
  message,
}: {
  param: string;
  messages?: Record<string, string>;
  message?: string;
}) {
  const { toast } = useToast();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    const params = new URLSearchParams(window.location.search);
    const value = params.get(param);
    if (!value) return;

    shown.current = true;
    const text = messages?.[value] ?? message ?? value;
    toast(text);
    window.history.replaceState(null, "", window.location.pathname);
  }, [param, messages, message, toast]);

  return null;
}
