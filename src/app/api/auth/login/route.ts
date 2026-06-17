/**
 * Autenticação do admin: login com e-mail/senha e logout (remoção do cookie).
 * Inclui rate limiting, bloqueio temporário e auditoria de tentativas.
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  setAdminSessionCookie,
  clearAdminSessionCookie,
} from "@/lib/auth";
import {
  assertLoginAllowed,
  enforceFailureDelay,
  getClientIp,
  LoginSecurityError,
  normalizeLoginEmail,
  recordLoginAttempt,
} from "@/lib/login-security";

// --- POST: valida credenciais e define cookie de sessão ---
export async function POST(request: NextRequest) {
  const startedAt = Date.now();

  try {
    const { email, password } = await request.json();

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeLoginEmail(email);
    const ip = getClientIp(request);

    await assertLoginAllowed(normalizedEmail, ip);

    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    const validPassword =
      admin && (await bcrypt.compare(password, admin.password));

    if (!admin || !validPassword) {
      await recordLoginAttempt(normalizedEmail, ip, false);
      await enforceFailureDelay(startedAt);

      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    await recordLoginAttempt(normalizedEmail, ip, true);

    const token = await createSession({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
    });

    const response = NextResponse.json({
      success: true,
      admin: { name: admin.name, email: admin.email },
    });

    setAdminSessionCookie(response, token);
    return response;
  } catch (error) {
    if (error instanceof LoginSecurityError) {
      const headers: Record<string, string> = {};
      if (error.retryAfterSeconds) {
        headers["Retry-After"] = String(error.retryAfterSeconds);
      }

      return NextResponse.json(
        {
          error: error.message,
          retryAfterSeconds: error.retryAfterSeconds,
        },
        { status: error.status, headers }
      );
    }

    return NextResponse.json(
      { error: "Erro ao fazer login" },
      { status: 500 }
    );
  }
}

// --- DELETE: encerra sessão removendo o cookie ---
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  clearAdminSessionCookie(response);
  return response;
}
