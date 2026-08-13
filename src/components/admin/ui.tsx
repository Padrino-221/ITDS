import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-forest-900">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({
  label,
  hint,
  required,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-gold-600">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{hint}</p>}
    </div>
  );
}

export const baseInput =
  "w-full rounded-lg border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20";

export function TextInput({
  icon,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft">
          {icon}
        </span>
      )}
      <input {...rest} className={cn(baseInput, icon ? "pl-10" : undefined, className)} />
    </div>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return <textarea {...rest} className={cn(baseInput, "leading-relaxed", className)} />;
}

export function Checkbox({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
      <input
        type="checkbox"
        {...props}
        className="h-4 w-4 rounded border-forest-300 accent-forest-700"
      />
      {label}
    </label>
  );
}

export function PrimaryButton({
  children,
  pending,
  disabled,
  className,
  type = "submit",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { pending?: boolean }) {
  return (
    <button
      type={type}
      disabled={pending || disabled}
      {...props}
      className={cn(
        "btn-pill inline-flex items-center justify-center gap-2 bg-forest-800 px-5 py-2.5 text-white transition-all hover:-translate-y-0.5 hover:bg-forest-700 disabled:translate-y-0 disabled:opacity-60",
        className
      )}
    >
      {children}
    </button>
  );
}

export function SaveButton({ pending }: { pending?: boolean }) {
  return (
    <PrimaryButton pending={pending}>
      {pending ? "Saving…" : "Save Changes"}
    </PrimaryButton>
  );
}

export function SecondaryButton({
  children,
  className,
  size = "sm",
  tone = "default",
  type = "submit",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md";
  tone?: "default" | "gold";
}) {
  return (
    <button
      type={type}
      {...props}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border font-semibold transition-colors",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm",
        tone === "gold"
          ? "border-gold-300 bg-gold-50 text-gold-800 hover:bg-gold-100"
          : "border-forest-200 bg-white text-forest-800 hover:border-forest-400",
        className
      )}
    >
      {children}
    </button>
  );
}

export function PrimaryLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "btn-pill inline-flex items-center gap-2 bg-forest-800 px-5 py-2.5 text-white transition-all hover:-translate-y-0.5 hover:bg-forest-700",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function SecondaryLink({
  href,
  children,
  className,
  size = "md",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-forest-200 bg-white font-semibold text-forest-800 transition-colors hover:border-forest-400",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-5 py-2.5 text-sm",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-forest-50 px-2.5 py-1 text-[11px] font-semibold text-forest-700">
      <span className="h-1.5 w-1.5 rounded-lg bg-forest-500" />
      Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-500">
      <span className="h-1.5 w-1.5 rounded-lg bg-stone-400" />
      Draft
    </span>
  );
}

export function AdminCard({
  children,
  className,
  title,
  action,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "dashed";
}) {
  return (
    <div
      className={cn(
        variant === "dashed"
          ? "rounded-xl border border-dashed border-forest-200 bg-white p-6"
          : "rounded-xl border border-forest-100 bg-white p-6",
        className
      )}
    >
      {title && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest-900">
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export const PAGE_SIZE = 20;

export function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  const href = (p: number) => `${basePath}?page=${p}`;

  return (
    <nav className="flex items-center justify-between rounded-xl border border-forest-100 bg-white px-5 py-3 text-sm" aria-label="Pagination">
      <span className="text-ink-soft">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link
            href={href(page - 1)}
            className="rounded-lg border border-forest-200 bg-white px-3 py-1.5 text-xs font-semibold text-forest-800 transition-colors hover:border-forest-400"
          >
            Previous
          </Link>
        )}
        {page < totalPages && (
          <Link
            href={href(page + 1)}
            className="rounded-lg border border-forest-200 bg-white px-3 py-1.5 text-xs font-semibold text-forest-800 transition-colors hover:border-forest-400"
          >
            Next
          </Link>
        )}
      </div>
    </nav>
  );
}

export function DataTable<T>({
  columns,
  rows,
  getKey,
  emptyMessage = "No items yet.",
  pagination,
}: {
  columns: Array<{
    key: string;
    header: string;
    align?: "left" | "right";
    className?: string;
    cell: (row: T) => React.ReactNode;
  }>;
  rows: T[];
  getKey: (row: T) => string;
  emptyMessage?: string;
  pagination?: {
    page: number;
    totalPages: number;
    basePath: string;
  };
}) {
  if (rows.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-forest-100 bg-white p-8 text-sm text-ink-soft">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-forest-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-forest-100 bg-forest-50/60 text-xs font-semibold uppercase tracking-wider text-ink-soft">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-5 py-3.5",
                      col.align === "right" && "text-right",
                      col.className
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-50">
              {rows.map((row) => (
                <tr key={getKey(row)} className="transition-colors hover:bg-forest-50/40">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-5 py-3.5",
                        col.align === "right" && "text-right",
                        col.className
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {pagination && <Pagination {...pagination} />}
    </div>
  );
}
