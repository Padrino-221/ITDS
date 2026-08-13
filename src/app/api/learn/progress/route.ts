import { NextResponse } from "next/server";
import { getLearnerSession } from "@/lib/learn-auth";
import { getCompletedLessonIds } from "@/lib/learn";

export const dynamic = "force-dynamic";

/** Completed lesson ids for the signed-in learner (empty when anonymous). */
export async function GET() {
  const learner = await getLearnerSession();
  if (!learner) {
    return NextResponse.json({ completedIds: [] }, { headers: { "Cache-Control": "no-store" } });
  }
  const completedIds = await getCompletedLessonIds(learner.id);
  return NextResponse.json(
    { completedIds: [...completedIds] },
    { headers: { "Cache-Control": "no-store" } }
  );
}
