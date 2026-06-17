/**
 * @layer unit
 * @module login-security
 * Testes unitários das funções puras de segurança do login.
 */
import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  LoginSecurityError,
  LOGIN_SECURITY,
  enforceFailureDelay,
  getClientIp,
  normalizeLoginEmail,
} from "@/lib/login-security";

describe("login-security / funções puras", () => {
  it("normaliza e-mail com trim e lowercase", () => {
    expect(normalizeLoginEmail("  Admin@Padaria.COM  ")).toBe("admin@padaria.com");
  });

  it("extrai IP de x-forwarded-for", () => {
    const request = new NextRequest("http://localhost/api/auth/login", {
      headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.1" },
    });
    expect(getClientIp(request)).toBe("203.0.113.1");
  });

  it("usa x-real-ip quando não há forwarded", () => {
    const request = new NextRequest("http://localhost/api/auth/login", {
      headers: { "x-real-ip": "198.51.100.42" },
    });
    expect(getClientIp(request)).toBe("198.51.100.42");
  });

  it("retorna unknown sem headers de IP", () => {
    const request = new NextRequest("http://localhost/api/auth/login");
    expect(getClientIp(request)).toBe("unknown");
  });

  it("LoginSecurityError expõe status e retryAfterSeconds", () => {
    const error = new LoginSecurityError("bloqueado", 429, 120);
    expect(error.status).toBe(429);
    expect(error.retryAfterSeconds).toBe(120);
    expect(error.message).toBe("bloqueado");
  });

  it("enforceFailureDelay aguarda o tempo mínimo configurado", async () => {
    vi.useFakeTimers();
    const startedAt = Date.now();

    const promise = enforceFailureDelay(startedAt);
    await vi.advanceTimersByTimeAsync(LOGIN_SECURITY.minFailureDelayMs);
    await promise;

    vi.useRealTimers();
  });
});
