import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  crumbs,
  accent = "gold",
}: {
  title: string;
  subtitle?: string;
  crumbs?: Array<{ label: string; href?: string }>;
  accent?: "gold" | "forest";
}) {
  const accentGlow =
    accent === "forest" ? "#3559ad" : "#ec3b6a";
  return (
    <section className="relative overflow-hidden bg-forest-950 py-16 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, ${accentGlow} 0, transparent 35%), radial-gradient(circle at 80% 20%, ${accentGlow} 0, transparent 30%)`,
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {crumbs && crumbs.length > 0 && (
          <nav
            className={cn(
              "mb-5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider",
              accent === "forest" ? "text-forest-300" : "text-gold-400"
            )}
          >
            {crumbs.map((crumb, i) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3 text-white/40" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className={
                      accent === "forest"
                        ? "transition-colors hover:text-forest-200"
                        : "transition-colors hover:text-gold-300"
                    }
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white/70">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="display-heading max-w-3xl text-4xl font-extrabold uppercase tracking-tight text-white text-balance sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-lg bg-gold-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-600">
          {eyebrow}
        </span>
      )}
      <h2 className="display-heading mt-3 text-3xl font-extrabold uppercase tracking-tight text-forest-950 text-balance sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 leading-relaxed text-ink-soft">{description}</p>
      )}
    </div>
  );
}

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
        className
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-forest-200 bg-white px-6 py-16 text-center">
      <p className="font-display text-lg font-bold text-forest-900">{title}</p>
      {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
    </div>
  );
}
