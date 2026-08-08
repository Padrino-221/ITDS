import { NextResponse } from "next/server";
import path from "path";
import { readFile } from "fs/promises";
import { contentTypeFor, uploadsDir } from "@/lib/uploads";

/**
 * GET /uploads/<name> — serves files stored in the gitignored uploads/
 * directory. Uploaded images are intentionally NOT placed in public/, so a
 * small route like this is the way they reach browsers. Content is served
 * with long-lived cache headers because upload names are unique/immutable.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const relative = segments.join("/");

  // Guard against path traversal — the resolved file must stay inside uploads/.
  const root = path.resolve(uploadsDir());
  const filePath = path.resolve(root, relative);
  if (filePath !== root && !filePath.startsWith(root + path.sep)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const data = await readFile(filePath);
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentTypeFor(relative),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
