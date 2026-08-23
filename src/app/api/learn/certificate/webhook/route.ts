import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { generateCertificateNo } from "@/lib/paystack";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

/**
 * Paystack webhook handler for certificate payments.
 *
 * Verifies the HMAC-SHA512 signature, then processes charge.success events
 * to issue certificates. Returns 200 OK immediately to avoid Paystack retries.
 *
 * Paystack retries: every 3 min for first 4 tries, then hourly for 72 hours.
 *
 * Set your webhook URL in the Paystack dashboard to:
 *   https://your-domain.com/api/learn/certificate/webhook
 */
export async function POST(req: NextRequest) {
  // Read the raw body for signature verification — must be the original string
  const rawBody = await req.text();

  // Verify signature
  const signature = req.headers.get("x-paystack-signature");
  if (!signature || !PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const hash = createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  if (hash !== signature) {
    // Invalid signature — return 200 to stop retries, but don't process
    console.warn("[webhook] Invalid signature — ignoring request");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Parse the event
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const eventType = event.event as string;

  // We only care about successful charges
  if (eventType !== "charge.success") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const data = event.data as Record<string, unknown> | undefined;
  if (!data) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const reference = data.reference as string;
  const status = data.status as string;
  const amount = data.amount as number;
  const metadata = (data.metadata ?? {}) as Record<string, unknown>;

  // Only process successful certificate payments
  if (status !== "success") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Check if this is a certificate payment
  if (metadata.type !== "certificate") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const learnerId = metadata.learnerId as string | undefined;
  const subjectId = metadata.subjectId as string | undefined;

  if (!learnerId || !subjectId) {
    console.warn("[webhook] Missing learnerId or subjectId in metadata");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  try {
    // Idempotent: check if certificate already exists for this reference or this learner+subject
    const existingByRef = await prisma.certificate.findUnique({
      where: { paystackRef: reference },
    });
    if (existingByRef) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const existingByLearner = await prisma.certificate.findUnique({
      where: { learnerId_subjectId: { learnerId, subjectId } },
    });
    if (existingByLearner) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Verify the subject exists and has a price set
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject || !subject.certificatePrice) {
      console.warn(`[webhook] Subject ${subjectId} not found or has no certificate price`);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Verify the learner exists
    const learner = await prisma.learner.findUnique({ where: { id: learnerId } });
    if (!learner) {
      console.warn(`[webhook] Learner ${learnerId} not found`);
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Issue the certificate — handle race condition with callback
    const certificateNo = generateCertificateNo(subject.slug);
    try {
      const cert = await prisma.certificate.create({
        data: {
          learnerId,
          subjectId,
          paystackRef: reference,
          amountPaid: amount,
          certificateNo,
        },
      });
      console.log(`[webhook] Certificate issued: ${certificateNo} for learner ${learnerId}, subject ${subjectId}`);

      // Send certificate email notification
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey && learner.email) {
        try {
          const resend = new Resend(resendKey);
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://itdsuenr.com";
          await resend.emails.send({
            from: process.env.RESEND_EMAIL_FROM ?? "ITDS E-Learning <onboarding@resend.dev>",
            to: learner.email,
            subject: `Your Certificate for ${subject.name} is Ready!`,
            html: `<div style="font-family:Arial,Helvetica,sans-serif;background-color:#f4f6fb;padding:32px 16px">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e7f0">
    <h1 style="margin:0 0 12px;font-size:20px;color:#0d3b2e">Certificate Issued!</h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#5a6a8a">
      Congratulations, ${learner.name}! Your certificate for <strong>${subject.name}</strong> has been issued.
    </p>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:16px;border:1px solid #e5e7eb">
      <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600">Certificate Number</p>
      <p style="margin:0;font-size:14px;color:#1a1a2e;font-family:monospace">${certificateNo}</p>
    </div>
            <a href="${siteUrl}/learn/certificate/${cert.id}" style="display:inline-block;background-color:#0d3b2e;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">View Your Certificate</a>
            <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#5a6a8a">
              Employers can verify this certificate anytime at
              ${siteUrl}/learn/verify?no=${certificateNo}
            </p>
            <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#9aa7c2">
              This certificate was issued by the Department of Information Technology and Decision Sciences, UENR.
            </p>
  </div>
</div>`,
          });
        } catch (err) {
          console.error("[webhook] Failed to send certificate email:", err);
        }
      }
    } catch (err: unknown) {
      // Unique constraint violation means the callback already created it — that's fine.
      if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
        console.log(`[webhook] Certificate already exists for learner ${learnerId}, subject ${subjectId} — skipping`);
      } else {
        throw err;
      }
    }
  } catch (error) {
    // Log but don't return error — we already returned 200 to avoid retries
    // In production, you might want to store failed webhooks for manual review
    console.error("[webhook] Error processing certificate:", error);
  }

  // Always return 200 OK to acknowledge receipt
  return NextResponse.json({ ok: true }, { status: 200 });
}
