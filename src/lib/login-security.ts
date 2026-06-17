/**
 * Camadas de segurança do login administrativo:
 * rate limiting, bloqueio temporário, auditoria e atraso em falhas.
 */

import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const LOGIN_SECURITY = {
  maxEmailAttempts: 5,
  maxIpAttempts: 20,
  windowMs: 15 * 60 * 1000,
  lockoutMs: 15 * 60 * 1000,
  minFailureDelayMs: 600,
} as const;

export class LoginSecurityError extends Error {
  status: number;
  retryAfterSeconds?: number;

  constructor(message: string, status: number, retryAfterSeconds?: number) {
    super(message);
    this.name = "LoginSecurityError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function normalizeLoginEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

function windowStart(): Date {
  return new Date(Date.now() - LOGIN_SECURITY.windowMs);
}

function retryAfterSeconds(oldestAttemptAt: Date): number {
  const unlockAt = oldestAttemptAt.getTime() + LOGIN_SECURITY.lockoutMs;
  return Math.max(1, Math.ceil((unlockAt - Date.now()) / 1000));
}

async function countRecentFailures(filter: {
  email?: string;
  ip?: string;
}): Promise<number> {
  const since = windowStart();

  return prisma.loginAttempt.count({
    where: {
      success: false,
      createdAt: { gte: since },
      ...(filter.email ? { email: filter.email } : {}),
      ...(filter.ip ? { ip: filter.ip } : {}),
    },
  });
}

async function getOldestRecentFailure(filter: {
  email?: string;
  ip?: string;
}): Promise<Date | null> {
  const since = windowStart();

  const attempt = await prisma.loginAttempt.findFirst({
    where: {
      success: false,
      createdAt: { gte: since },
      ...(filter.email ? { email: filter.email } : {}),
      ...(filter.ip ? { ip: filter.ip } : {}),
    },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  return attempt?.createdAt ?? null;
}

/** Bloqueia login se e-mail ou IP exceder tentativas na janela configurada. */
export async function assertLoginAllowed(email: string, ip: string): Promise<void> {
  const [emailFailures, ipFailures] = await Promise.all([
    countRecentFailures({ email }),
    countRecentFailures({ ip }),
  ]);

  if (emailFailures >= LOGIN_SECURITY.maxEmailAttempts) {
    const oldest = await getOldestRecentFailure({ email });
    const retry = oldest ? retryAfterSeconds(oldest) : 60;
    throw new LoginSecurityError(
      "Muitas tentativas para este e-mail. Aguarde alguns minutos e tente novamente.",
      429,
      retry
    );
  }

  if (ipFailures >= LOGIN_SECURITY.maxIpAttempts) {
    const oldest = await getOldestRecentFailure({ ip });
    const retry = oldest ? retryAfterSeconds(oldest) : 60;
    throw new LoginSecurityError(
      "Muitas tentativas a partir deste dispositivo. Tente novamente mais tarde.",
      429,
      retry
    );
  }
}

/** Registra tentativa de login para auditoria e controle de brute force. */
export async function recordLoginAttempt(
  email: string,
  ip: string,
  success: boolean
): Promise<void> {
  await prisma.loginAttempt.create({
    data: { email, ip, success },
  });

  // Limpeza leve de registros antigos (30 dias)
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await prisma.loginAttempt.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
}

/** Atraso mínimo em falhas para dificultar enumeração de credenciais. */
export async function enforceFailureDelay(startedAt: number): Promise<void> {
  const elapsed = Date.now() - startedAt;
  const remaining = LOGIN_SECURITY.minFailureDelayMs - elapsed;

  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
}
