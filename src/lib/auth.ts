/**
 * Utilitários de autenticação do painel administrativo.
 * Cria, verifica e lê sessões JWT armazenadas no cookie admin_session.
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { JWT_SECRET } from "@/lib/jwt-secret";

const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias
const JWT_ISSUER = "tutti-pane";
const JWT_AUDIENCE = "admin";

// --- Payload da sessão do administrador ---
export interface AdminSession {
  adminId: string;
  email: string;
  name: string;
}

// --- Criação e verificação do token JWT ---
export async function createSession(payload: AdminSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

// --- Leitura da sessão a partir do cookie da requisição ---
export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

// --- Exige sessão válida; lança erro se não autenticado (uso em APIs/server) ---
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("Não autorizado");
  }
  return session;
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
  };
}

/** Define cookie de sessão admin com flags de segurança. */
export function setAdminSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    ...sessionCookieOptions(),
    maxAge: SESSION_MAX_AGE,
  });
}

/** Remove cookie de sessão admin. */
export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
}
