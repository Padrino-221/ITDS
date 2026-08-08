import Link from "next/link";
import { cn } from "@/lib/utils";

type MarqueeItem = {
  label: string;
  href?: string;
};

export default function Marquee({
  items,
  className,
}: {
  items: MarqueeItem[];
  className?: string;
}) {
  const duplicated = [...items, ...items, ...items];

  return (
    <div
      className={cn(
        "relative overflow-hidden border-y border-forest-800 bg-forest-950 py-4",
        className
      )}
    >
      <div className="flex w-max animate-marquee">
        {duplicated.map((item, i) => (
          <Link
            key={`${item.label}-${i}`}
            href={item.href || "#"}
            className="mx-8 flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-white/70 transition-colors hover:text-gold-400"
          >
            <span className="h-2 w-2 rounded-full bg-gold-500" />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
