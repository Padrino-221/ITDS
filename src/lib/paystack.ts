/**
 * Paystack payment integration for certificate purchases.
 *
 * Environment variables:
 *   PAYSTACK_SECRET_KEY — Secret key from Paystack dashboard
 *   NEXT_PUBLIC_SITE_URL — Canonical site URL for redirects
 */

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://itdsuenr.com";

if (!PAYSTACK_SECRET_KEY) {
  console.warn("PAYSTACK_SECRET_KEY is not set — certificate payments will fail.");
}

const PAYSTACK_API = "https://api.paystack.co";

/**
 * Local development fallback: with no secret key outside production, the
 * transaction functions below simulate a successful checkout so the whole
 * certificate flow (pay → callback → issue) can be exercised offline.
 * The mock authorization URL redirects straight back to the callback page
 * with the reference, exactly like a real Paystack success redirect.
 * Never active in production — there a missing key fails loudly instead.
 */
const MOCK_PAYSTACK = !PAYSTACK_SECRET_KEY && process.env.NODE_ENV !== "production";

// In-memory store of simulated transactions (reference → metadata + amount).
// Kept on globalThis because Next bundles route handlers and pages
// separately — a module-level Map would be instantiated once per bundle and
// the verify step would never see what initialize stored. globalThis is
// shared across every bundle in the process. Dev-only convenience.
const mockStore = ((globalThis as Record<string, unknown>).__mockPaystackTx ??= new Map<
  string,
  { amount: number; metadata: Record<string, unknown> }
>()) as Map<string, { amount: number; metadata: Record<string, unknown> }>;

async function paystackFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${PAYSTACK_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!data.status) {
    throw new Error(data.message || "Paystack API error");
  }
  return data.data as T;
}

export type InitializeTransactionParams = {
  email: string;
  amount: number; // in GHS pesewas (e.g. 5000 = GHS 50.00)
  reference?: string;
  metadata?: Record<string, unknown>;
};

export type TransactionResponse = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type TransactionVerification = {
  id: number;
  domain: string;
  amount: number;
  currency: string;
  transaction_date: string;
  status: string;
  reference: string;
  metadata: Record<string, unknown>;
  gateway_response: string;
};

/**
 * Initialize a Paystack transaction for certificate payment.
 */
export async function initializeTransaction(
  params: InitializeTransactionParams
): Promise<TransactionResponse> {
  if (MOCK_PAYSTACK) {
    mockStore.set(params.reference ?? "", {
      amount: params.amount,
      metadata: params.metadata ?? {},
    });
    return {
      authorization_url: `${SITE_URL}/learn/certificate/callback?reference=${params.reference}`,
      access_code: `MOCK_${params.reference}`,
      reference: params.reference ?? "",
    };
  }

  return paystackFetch<TransactionResponse>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      amount: params.amount, // Paystack expects amount in smallest currency unit
      reference: params.reference,
      callback_url: `${SITE_URL}/learn/certificate/callback`,
      metadata: params.metadata ?? {},
    }),
  });
}

/**
 * Verify a Paystack transaction by reference.
 */
export async function verifyTransaction(
  reference: string
): Promise<TransactionVerification> {
  if (MOCK_PAYSTACK) {
    const stored = mockStore.get(reference);
    if (!stored) throw new Error("Mock transaction not found (server restarted?)");
    return {
      id: 0,
      domain: "test",
      amount: stored.amount,
      currency: "GHS",
      transaction_date: new Date().toISOString(),
      status: "success",
      reference,
      metadata: stored.metadata,
      gateway_response: "Approved by mock",
    };
  }

  return paystackFetch<TransactionVerification>(
    `/transaction/verify/${reference}`
  );
}

/**
 * Generate a unique certificate number.
 * Format: ITDS-YYYY-SUBJECT-NNN
 */
export function generateCertificateNo(subjectSlug: string): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 999)
    .toString()
    .padStart(3, "0");
  return `ITDS-${year}-${subjectSlug.slice(0, 3).toUpperCase()}-${rand}`;
}
