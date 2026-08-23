import { NextRequest, NextResponse } from "next/server";
import { getLearnerSession } from "@/lib/learn-auth";
import { prisma } from "@/lib/prisma";
import { initializeTransaction } from "@/lib/paystack";
import { checkCertificateEligibilityFor } from "@/lib/learn";

export async function POST(req: NextRequest) {
  const learner = await getLearnerSession();
  if (!learner) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { subjectId } = await req.json();
  if (!subjectId) {
    return NextResponse.json({ error: "subjectId required" }, { status: 400 });
  }

  // Get subject
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }
  if (!subject.certificatePrice) {
    return NextResponse.json({ error: "Certificates not available for this course" }, { status: 400 });
  }

  // Check eligibility using shared helper
  const eligibility = await checkCertificateEligibilityFor(learner.id, subjectId);
  if (eligibility.hasCertificate) {
    return NextResponse.json({ error: "Certificate already exists" }, { status: 400 });
  }
  if (!eligibility.eligible) {
    return NextResponse.json({ error: eligibility.reason ?? "Not eligible" }, { status: 400 });
  }

  // Initialize Paystack transaction
  const reference = `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    const transaction = await initializeTransaction({
      email: learner.email,
      amount: subject.certificatePrice,
      reference,
      metadata: {
        learnerId: learner.id,
        subjectId,
        learnerName: learner.name,
        subjectName: subject.name,
        type: "certificate",
      },
    });

    return NextResponse.json({ authorizationUrl: transaction.authorization_url, reference });
  } catch (error) {
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}
