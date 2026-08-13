import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Staff session endpoint for client components on /learn (the header account
 * menu). Reads the Staff Panel cookie (`itds_session`) so lecturers, editors
 * and admins can see the Author/Review links without making the learn pages
 * render dynamically. Learner sessions live in a separate cookie and are
 * served by /api/learn/session.
 */
export async function GET() {
  const user = await getSession();
  return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
}