"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { Send } from "lucide-react";
import { subscribeNewsletter, type ActionState } from "@/app/actions";
import { useToast } from "@/components/admin/Toast";

const initialState: ActionState = { ok: false, message: "" };

export default function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeNewsletter, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.message) return;
    toast(state.message, state.ok ? "success" : "error");
    if (state.ok) formRef.current?.reset();
  }, [state, toast]);

  return (
    <div>
      <form ref={formRef} action={formAction} className="mt-3 flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="Enter your email"
          className="w-full min-w-0 rounded-lg border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-forest-300 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gold-400 disabled:opacity-60"
        >
          <Send className="h-3.5 w-3.5" />
          {pending ? "Sending…" : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
