import sharp from "sharp";
import { prisma } from "./prisma";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB — matches ImageUpload

export const MAX_RESOURCE_BYTES = 10 * 1024 * 1024; // 10MB for documents

export const MAX_IMAGE_DIMENSION = 1920;
export const IMAGE_JPEG_QUALITY = 80;
export const IMAGE_WEBP_QUALITY = 80;
export const IMAGE_AVIF_QUALITY = 50;
export const IMAGE_PNG_COMPRESSION_LEVEL = 9;

const COMPRESSIBLE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export function isCompressibleImage(mime: string): boolean {
  return COMPRESSIBLE_IMAGE_TYPES.has(mime);
}

/**
 * Compress and resize a raster image via sharp.
 * - Auto-rotates based on EXIF.
 * - Resizes to fit within MAX_IMAGE_DIMENSION (preserves aspect, no enlargement).
 * - Re-encodes with quality settings appropriate for the format.
 * Returns the original bytes on failure or for non-compressible types.
 */
export async function compressImage(
  input: Uint8Array<ArrayBuffer>,
  mime: string
): Promise<Uint8Array<ArrayBuffer>> {
  if (!isCompressibleImage(mime)) return input;
  try {
    const pipeline = sharp(Buffer.from(input)).rotate().resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });

    let buffer: Buffer;
    switch (mime) {
      case "image/jpeg":
        buffer = await pipeline.jpeg({ quality: IMAGE_JPEG_QUALITY, mozjpeg: true }).toBuffer();
        break;
      case "image/png":
        buffer = await pipeline.png({ compressionLevel: IMAGE_PNG_COMPRESSION_LEVEL, palette: true }).toBuffer();
        break;
      case "image/webp":
        buffer = await pipeline.webp({ quality: IMAGE_WEBP_QUALITY }).toBuffer();
        break;
      case "image/avif":
        buffer = await pipeline.avif({ quality: IMAGE_AVIF_QUALITY }).toBuffer();
        break;
      default:
        return input;
    }

    // Only use compressed version if it's actually smaller (e.g. tiny icons)
    if (buffer.length >= input.length) return input;
    return new Uint8Array(buffer) as Uint8Array<ArrayBuffer>;
  } catch {
    return input;
  }
}

export const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "application/zip",
]);

/** Extension for a browser-reported MIME type (images + documents). */
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
    case "application/pdf":
      return ".pdf";
    case "application/msword":
      return ".doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return ".docx";
    case "application/vnd.ms-excel":
      return ".xls";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return ".xlsx";
    case "application/vnd.ms-powerpoint":
      return ".ppt";
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return ".pptx";
    case "text/plain":
      return ".txt";
    case "application/zip":
      return ".zip";
    default:
      return ".bin";
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
    case "pdf":
      return "application/pdf";
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls":
      return "application/vnd.ms-excel";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "ppt":
      return "application/vnd.ms-powerpoint";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "txt":
      return "text/plain";
    case "zip":
      return "application/zip";
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