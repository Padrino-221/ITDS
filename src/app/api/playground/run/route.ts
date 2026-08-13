import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { isPlaygroundLanguage, runCode } from "@/lib/playground";

// In-memory sliding window rate limiter (single instance — fine for this app).
const buckets = new Map<string, number[]>();

function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Slow down heavy playground usage without locking out legitimate learners.
  const fwd = (await headers()).get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`playground:${ip}`, 40, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a few minutes." },
      { status: 429 }
    );
  }

  let body: { language?: unknown; code?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { language, code } = body;
  if (
    typeof language !== "string" ||
    typeof code !== "string" ||
    !isPlaygroundLanguage(language)
  ) {
    return NextResponse.json({ error: "Unsupported language or missing code." }, { status: 400 });
  }
  if (code.length === 0) {
    return NextResponse.json({ error: "Nothing to run." }, { status: 400 });
  }
  if (code.length > 20_000) {
    return NextResponse.json({ error: "Code is too long (20,000 char limit)." }, { status: 413 });
  }

  try {
    const result = await runCode(language, code);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Execution service unavailable." },
      { status: 502 }
    );
  }
}
