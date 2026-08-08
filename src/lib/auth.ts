import { SignJWT, jwtVerify } from "jose";
import { compare, hash } from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

const COOKIE_NAME = "itds_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const secret = () =>
  new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "itds-dev-secret-change-me-in-production"
  );

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
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: proto === "https",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
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
  loginPath = "/learn/account/signin"
): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect(loginPath);
  if (!roles.includes(user.role)) redirect("/learn");
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
