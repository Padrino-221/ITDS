import { NextRequest, NextResponse } from "next/server";
import { getLearnerSession } from "@/lib/learn-auth";
import { checkCertificateEligibilityFor } from "@/lib/learn";

export async function GET(req: NextRequest) {
  const learner = await getLearnerSession();
  if (!learner) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const subjectId = req.nextUrl.searchParams.get("subjectId");
  if (!subjectId) {
    return NextResponse.json({ error: "subjectId required" }, { status: 400 });
  }

  const result = await checkCertificateEligibilityFor(learner.id, subjectId);
  return NextResponse.json(result);
}
