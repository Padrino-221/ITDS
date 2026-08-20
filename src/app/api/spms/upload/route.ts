import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSpmsSession } from "@/lib/spms-auth";
import { saveUpload } from "@/lib/uploads";

const ALLOWED_TYPES = new Set(["application/pdf"]);
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

/**
 * POST /api/spms/upload — saves a PDF document for SPMS projects.
 * Requires an authenticated SPMS session (LECTURER or ADMIN).
 */
export async function POST(request: Request) {
  const session = await getSpmsSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
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
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Please upload a PDF file." },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File size must be under 20MB." },
      { status: 413 }
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const name = `spms-${Date.now()}-${randomUUID().slice(0, 8)}.pdf`;
  await saveUpload(name, file.type, bytes);

  return NextResponse.json({ url: `/uploads/${name}` });
}
