export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Canonical production origin — single source for sitemaps and structured data. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://itdsuenr.com";

/** Canonical origin of the E-Learning Hub (served on its own subdomain). */
export const LEARN_URL = process.env.NEXT_PUBLIC_LEARN_URL ?? "https://learn.itdsuenr.com";

/** Resolve a path (e.g. "/news/foo") or absolute URL to a full canonical URL. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Split a multi-paragraph string (blank-line separated) into paragraphs. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "image"; alt: string; src: string };

/**
 * Split a multi-paragraph string into content blocks, hoisting lines written
 * as ![alt](url) into image blocks so images can sit between paragraphs.
 */
export function contentBlocks(text: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  for (const chunk of text.split(/\n\s*\n/)) {
    const trimmed = chunk.trim();
    const image = trimmed.match(/^!\[([\s\S]*?)\]\(([\s\S]*?)\)\s*$/);
    if (image) {
      blocks.push({ type: "image", alt: image[1], src: image[2].trim() });
    } else if (trimmed) {
      blocks.push({ type: "paragraph", text: trimmed });
    }
  }
  return blocks;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
