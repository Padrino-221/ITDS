import { SignJWT, jwtVerify } from "jose";
import { compare, hash } from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

const COOKIE_NAME = "itds_spms_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const secret = () =>
  new TextEncoder().encode(
    process.env.SPMS_AUTH_SECRET ?? process.env.AUTH_SECRET ?? "itds-spms-dev-secret"
  );

export type SpmsRole = "ADMIN" | "LECTURER";

export type SpmsSessionUser = {
  id: string;
  name: string;
  email: string;
  role: SpmsRole;
};

const VALID_ROLES: SpmsRole[] = ["ADMIN", "LECTURER"];

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashValue: string): Promise<boolean> {
  return compare(password, hashValue);
}

export async function createSpmsSession(user: SpmsSessionUser): Promise<void> {
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
  const proto = (await headers()).get("x-forwarded-proto") ?? "http";
  const attrs: Record<string, string | number | boolean> = {
    httpOnly: true,
    sameSite: "lax",
    secure: proto === "https",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  };
  cookieStore.set(COOKIE_NAME, token, attrs);
}

export async function destroySpmsSession(): Promise<void> {
  const cookieStore = await cookies();
  const proto = (await headers()).get("x-forwarded-proto") ?? "http";
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: proto === "https",
    maxAge: 0,
    path: "/",
  });
}

export async function getSpmsSession(): Promise<SpmsSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.name !== "string" || typeof payload.email !== "string") {
      return null;
    }
    const role = payload.role as SpmsRole;
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

/** Guard for any signed-in SPMS supervisor. Redirects to /spms/login. */
export async function requireSpmsAuth(): Promise<SpmsSessionUser> {
  const user = await getSpmsSession();
  if (!user) redirect("/spms/login");
  return user;
}

/** Guard for admin-only SPMS pages. */
export async function requireSpmsAdmin(): Promise<SpmsSessionUser> {
  const user = await requireSpmsAuth();
  if (user.role !== "ADMIN") redirect("/spms/dashboard");
  return user;
}

/** Authenticate a supervisor against the Supervisor table. */
export async function authenticateSpms(
  email: string,
  password: string
): Promise<SpmsSessionUser | null> {
  const supervisor = await prisma.supervisor.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!supervisor) return null;
  const ok = await verifyPassword(password, supervisor.passwordHash);
  if (!ok) return null;
  return {
    id: supervisor.id,
    name: supervisor.name,
    email: supervisor.email,
    role: supervisor.role as SpmsRole,
  };
}
