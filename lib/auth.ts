import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { sql } from "./db";
import type { Role, SessionUser } from "./auth-shared";

export type { Role, SessionUser } from "./auth-shared";
export { ROLE_LABEL } from "./auth-shared";

const COOKIE_NAME = "previna_session";
const secretKey = () =>
  new TextEncoder().encode(process.env.AUTH_SECRET || "previna-dev-secret-troque-em-producao");

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export async function verifyLogin(email: string, password: string): Promise<SessionUser | null> {
  const rows = await sql`
    select id, name, email, password_hash, role from users where email = ${email} limit 1
  `;
  const user = rows[0] as
    | { id: string; name: string; email: string; password_hash: string; role: Role }
    | undefined;
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
