import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { cookieDomain, hashPassword, verifyPassword } from "./auth";
import { learnUrl } from "./utils";

/**
 * Authentication for the E-Learning Hub (/learn).
 *
 * Deliberately independent from the Staff Panel session (`itds_session`):
 * it uses its own cookie and its own account table (`Learner`), so a learner
 * account can never reach the staff panel and a staff login is never treated
 * as a learner on /learn.
 */
export type LearnerSession = {
  id: string;
  name: string;
  email: string;
};

const COOKIE_NAME = "itds_learn_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const secret = () =>
  new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "itds-dev-secret-change-me-in-production"
  );

export async function authenticateLearner(
  email: string,
  password: string
): Promise<LearnerSession | null> {
  const learner = await prisma.learner.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!learner) return null;
  const ok = await verifyPassword(password, learner.passwordHash);
  if (!ok) return null;
  return { id: learner.id, name: learner.name, email: learner.email };
}

export async function createLearnerSession(user: LearnerSession): Promise<void> {
  const token = await new SignJWT({
    name: user.name,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());

  const cookieStore = await cookies();
  const proto = (await headers()).get("x-forwarded-proto") ?? "http";
  const domain = proto === "https" ? await cookieDomain() : "";
  const attrs: Record<string, string | number | boolean> = {
    httpOnly: true,
    sameSite: "lax",
    secure: proto === "https",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  };
  if (domain) attrs.domain = domain;
  cookieStore.set(COOKIE_NAME, token, attrs);
}

export async function destroyLearnerSession(): Promise<void> {
  const cookieStore = await cookies();
  const proto = (await headers()).get("x-forwarded-proto") ?? "http";
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: proto === "https",
    maxAge: 0,
    path: "/",
    ...(proto === "https" ? { domain: await cookieDomain() } : {}),
  });
}

export async function getLearnerSession(): Promise<LearnerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.name !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

/**
 * Guard for the learner account area. Unauthenticated learners are sent to
 * the hub's sign-in page. Staff Panel logins do not count (separate cookie).
 */
export async function requireLearner(
  loginPath = learnUrl("/account/signin")
): Promise<LearnerSession> {
  const user = await getLearnerSession();
  if (!user) redirect(loginPath);
  return user;
}

// Re-exported so learner-facing actions share one password utility story
// with the staff panel without importing the staff module directly.
export { hashPassword };