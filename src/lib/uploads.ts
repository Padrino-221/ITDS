import { prisma } from "./prisma";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB — matches ImageUpload

/** Extension for a browser-reported image MIME type. */
export function extForMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpg";
    case "image/gif":
      return ".gif";
    case "image/webp":
      return ".webp";
    case "image/avif":
      return ".avif";
    case "image/svg+xml":
      return ".svg";
    default:
      return ".img";
  }
}

/** Content-Type header for a stored file name. */
export function contentTypeFor(fileName: string): string {
  switch (fileName.split(".").pop()?.toLowerCase()) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

/**
 * Persist an uploaded file. Files live in the Upload table (BYTEA) rather
 * than the filesystem so uploads survive on Vercel's serverless infrastructure
 * (its filesystem is read-only and per-request).
 */
export async function saveUpload(
  name: string,
  contentType: string,
  data: Uint8Array<ArrayBuffer>
): Promise<void> {
  await prisma.upload.upsert({
    where: { name },
    update: { contentType, size: data.length, data },
    create: { name, contentType, size: data.length, data },
  });
}

/** Fetch a stored upload; returns null when it does not exist. */
export async function readUpload(
  name: string
): Promise<{ data: Uint8Array; contentType: string } | null> {
  const row = await prisma.upload.findUnique({ where: { name } });
  if (!row) return null;
  return { data: row.data, contentType: row.contentType };
}

/**
 * Safely delete a previously-uploaded file, if the URL points at a stored
 * upload. Used when an image is replaced or its record deleted. Non-upload
 * URLs (e.g. /images/... shipped with the repo) are ignored.
 */
export async function removeUploadFile(url: string): Promise<void> {
  if (!url.startsWith("/uploads/") || url.includes("..")) return;
  const name = url.slice("/uploads/".length);
  if (!name) return;
  try {
    await prisma.upload.deleteMany({ where: { name } });
  } catch {
    // Row already gone or never existed — nothing to do.
  }
}