import path from "path";
import { mkdir, unlink } from "fs/promises";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB — matches ImageUpload

/** Absolute path to the gitignored uploads directory. */
export function uploadsDir(): string {
  return path.join(process.cwd(), "uploads");
}

export async function ensureUploadsDir(): Promise<string> {
  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });
  return dir;
}

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

/**
 * Safely delete a previously-uploaded file, if the URL points inside the
 * uploads directory. Used when an image is replaced or its record deleted.
 */
export async function removeUploadFile(url: string): Promise<void> {
  if (!url.startsWith("/uploads/") || url.includes("..")) return;
  const root = path.resolve(uploadsDir());
  const filePath = path.resolve(root, url.slice("/uploads/".length));
  if (filePath !== root && filePath.startsWith(root + path.sep)) {
    try {
      await unlink(filePath);
    } catch {
      // File already gone or never existed — nothing to do.
    }
  }
}

/** Content-Type header for a stored file name. */
export function contentTypeFor(fileName: string): string {
  switch (path.extname(fileName).toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".avif":
      return "image/avif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}
