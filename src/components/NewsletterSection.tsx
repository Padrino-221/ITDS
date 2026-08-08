import { Send } from "lucide-react";
import NewsletterForm from "./NewsletterForm";

export default function NewsletterSection() {
  return (
    <section className="relative overflow-hidden bg-forest-900 py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, #ec3b6a 0, transparent 40%), radial-gradient(circle at 80% 30%, #ec3b6a 0, transparent 35%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-400">
            <Send className="h-4 w-4" />
            Our Newsletter
          </span>
          <h2 className="display-heading mt-5 text-3xl font-extrabold uppercase tracking-tight text-white text-balance sm:text-4xl">
            Subscribe for Digital Growth Tips & Updates
          </h2>
          <p className="mt-4 text-white/70">
            Stay updated with the latest news, research breakthroughs, and opportunities
            from the ITDS department.
          </p>
          <div className="mt-5">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}
