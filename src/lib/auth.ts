/**
 * Utilitários de autenticação do painel administrativo.
 * Cria, verifica e lê sessões JWT armazenadas no cookie admin_session.
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { JWT_SECRET } from "@/lib/jwt-secret";

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
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

// --- Leitura da sessão a partir do cookie da requisição ---
export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
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
