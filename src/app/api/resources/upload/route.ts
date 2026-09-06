import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import type { SessionRole } from "@/lib/auth";
import { ALLOWED_DOCUMENT_TYPES, extForMime, MAX_RESOURCE_BYTES, saveUpload } from "@/lib/uploads";

const STAFF_ROLES: SessionRole[] = ["ADMIN", "EDITOR", "LECTURER"];

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !STAFF_ROLES.includes(session.role)) {
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
  // Allow images + documents via the same Upload table
  const isAllowed = ALLOWED_DOCUMENT_TYPES.has(file.type) || file.type.startsWith("image/");
  if (!isAllowed) {
    return NextResponse.json(
      { error: "Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, images." },
      { status: 400 }
    );
  }
  if (file.size > MAX_RESOURCE_BYTES) {
    return NextResponse.json(
      { error: "File is larger than 10MB. Please choose a smaller file." },
      { status: 413 }
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const name = `${Date.now()}-${randomUUID().slice(0, 8)}${extForMime(file.type)}`;
  await saveUpload(name, file.type, bytes);

  return NextResponse.json({ url: `/uploads/${name}`, name: file.name });
}
