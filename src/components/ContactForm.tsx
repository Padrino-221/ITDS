"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { Loader2, Send } from "lucide-react";
import { submitContact, type ActionState } from "@/app/actions";
import { useToast } from "@/components/admin/Toast";

const initialState: ActionState = { ok: false, message: "" };

const inputClasses =
  "w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20";

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.message) return;
    toast(state.message, state.ok ? "success" : "error");
    if (state.ok) formRef.current?.reset();
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-ink">
            Full name
          </label>
          <input id="contact-name" name="name" required placeholder="Your name" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-ink">
            Email address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className={inputClasses}
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium text-ink">
          Subject
        </label>
        <input
          id="contact-subject"
          name="subject"
          required
          placeholder="How can we help?"
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="Write your message…"
          className={inputClasses}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="btn-pill bg-forest-800 px-7 py-3 text-white hover:-translate-y-0.5 hover:bg-forest-700 disabled:translate-y-0 disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {pending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
