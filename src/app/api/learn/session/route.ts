import { NextResponse } from "next/server";
import { getLearnerSession } from "@/lib/learn-auth";

export const dynamic = "force-dynamic";

/**
 * Session endpoint for the e-learning app's client components (header
 * account menu, lesson progress sidebar). Keeping the session out of the
 * server-rendered public pages is what lets /learn and its lessons be
 * statically generated with ISR instead of rendering dynamically on every
 * request.
 *
 * Learner-scoped: reads the hub's own cookie (`itds_learn_session`), so a
 * Staff Panel login is never treated as a learner here.
 */
export async function GET() {
  const user = await getLearnerSession();
  return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
}
