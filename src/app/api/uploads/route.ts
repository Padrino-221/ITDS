import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import type { SessionRole } from "@/lib/auth";
import { getSpmsSession } from "@/lib/spms-auth";
import { extForMime, MAX_UPLOAD_BYTES, saveUpload } from "@/lib/uploads";

// Staff accounts and SPMS supervisors may upload files.
const STAFF_ROLES: SessionRole[] = ["ADMIN", "EDITOR", "LECTURER"];

// Raster formats only — SVG (and other XML-based "images") can carry scripts
// and would be a stored-XSS vector if ever served/opened outside an <img>.
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/avif",
]);

/**
 * POST /api/uploads — saves an image file into the gitignored uploads/
 * directory and returns its public URL (/uploads/<name>). Requires an
 * authenticated staff session (same session as the staff panel).
 *
 * The upload runs as a plain route handler, so it is not subject to the
 * server-action body size limit — images no longer travel as base64 data
 * URLs inside form submissions.
 */
export async function POST(request: Request) {
  const staffSession = await getSession();
  const spmsSession = await getSpmsSession();
  if (!staffSession && !spmsSession) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (staffSession && !STAFF_ROLES.includes(staffSession.role)) {
    return NextResponse.json(
      { error: "Only staff accounts can upload files." },
      { status: 403 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Please choose an image file (PNG, JPG or GIF)." },
      { status: 400 }
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "The image is larger than 5MB. Please choose a smaller file." },
      { status: 413 }
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const name = `${Date.now()}-${randomUUID().slice(0, 8)}${extForMime(file.type)}`;
  await saveUpload(name, file.type, bytes);

  return NextResponse.json({ url: `/uploads/${name}` });
}
