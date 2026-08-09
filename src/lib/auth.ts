import { SignJWT, jwtVerify } from "jose";
import { compare, hash } from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { LEARN_URL, SITE_URL, learnUrl } from "./utils";

const COOKIE_NAME = "itds_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const secret = () =>
  new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "itds-dev-secret-change-me-in-production"
  );

/**
 * The registrable domain (e.g. ".itdsuenr.com") the session cookie is scoped
 * to, so a single sign-in carries across the main site and the /learn
 * subdomain. The domain is resolved from the *actual request host* (not the
 * configured SITE_URL) so host-only cookies are kept on hosts that are not on
 * the registered domain — e.g. Vercel preview hosts where a `.itdsuenr.com`
 * domain would silently break sessions and every authenticated call.
 *
 * Only applied behind HTTPS — local development over plain HTTP keeps a
 * host-only cookie (".localhost" would never match).
 */
async function cookieDomain(): Promise<string> {
  const host = (await headers()).get("x-forwarded-host") ?? (await headers()).get("host");
  if (!host) return "";
  const hostname = host.replace(/^www\./i, "").split(":")[0].toLowerCase();
  const strip = (h: string) => h.replace(/^www\./i, "").toLowerCase();
  const main = strip(new URL(SITE_URL).hostname);
  const learn = strip(new URL(LEARN_URL).hostname);
  const match = [main, learn].find(
    (d) => d && (hostname === d || hostname.endsWith(`.${d}`))
  );
  return match ? `.${match}` : "";
}

export type SessionRole = "ADMIN" | "EDITOR" | "LECTURER" | "STUDENT";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: SessionRole;
};

const VALID_ROLES: SessionRole[] = ["ADMIN", "EDITOR", "LECTURER", "STUDENT"];

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashValue: string): Promise<boolean> {
  return compare(password, hashValue);
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());

  const cookieStore = await cookies();
  // Only mark the cookie as secure when the site is actually served over
  // HTTPS (e.g. behind a reverse proxy / on Vercel), so local testing with
  // `npm start` over plain HTTP still works.
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

export async function destroySession(): Promise<void> {
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

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.name !== "string" || typeof payload.email !== "string") {
      return null;
    }
    const role = payload.role as SessionRole;
    if (!VALID_ROLES.includes(role)) return null;
    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role,
    };
  } catch {
    return null;
  }
}

/** The only session role that counts as a signed-in learner on /learn. */
export const LEARNER_ROLES: SessionRole[] = ["STUDENT"];

/**
 * Learner-scoped session for the e-learning platform. The whole app shares
 * one session cookie, so a Staff Panel login (editor/admin) would otherwise
 * look like a signed-in account on /learn. Only STUDENT accounts may use the
 * e-learning hub.
 */
export async function getLearnerSession(): Promise<SessionUser | null> {
  const user = await getSession();
  if (!user || !LEARNER_ROLES.includes(user.role)) return null;
  return user;
}

/** Guard the e-learning platform for learner accounts only. */
export async function requireLearner(
  loginPath = learnUrl("/account/signin")
): Promise<SessionUser> {
  const user = await getLearnerSession();
  if (!user) redirect(loginPath);
  return user;
}

/** Guard for any signed-in user. Redirects to the given login page. */
export async function requireAuth(redirectTo = "/staff-panel/login"): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect(redirectTo);
  return user;
}

/** Guard for ADMIN role only (e.g. user management). */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") redirect("/staff-panel");
  return user;
}

/**
 * Guard for any of the given roles. Unauthenticated users are sent to
 * `loginPath`; authenticated users without a matching role are sent home.
 */
export async function requireRole(
  roles: SessionRole[],
  loginPath = learnUrl("/account/signin")
): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect(loginPath);
  if (!roles.includes(user.role)) redirect(learnUrl("/"));
  return user;
}

export async function authenticate(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
