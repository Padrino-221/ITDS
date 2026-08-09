import { NextResponse } from "next/server";
import { readUpload } from "@/lib/uploads";

/**
 * GET /uploads/<name> — serves files stored in the Upload table.
 * Uploaded images are intentionally NOT placed in public/, so a small route
 * like this is the way they reach browsers. Content is served with long-lived
 * cache headers because upload names are unique/immutable.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const relative = segments.join("/");

  // Guard against path traversal — names are single tokens from the upload
  // endpoint; any slash/segment trickery or partial name is rejected.
  if (segments.length !== 1 || !relative || relative.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const stored = await readUpload(relative);
  if (!stored) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(stored.data as BodyInit, {
    headers: {
      "Content-Type": stored.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}