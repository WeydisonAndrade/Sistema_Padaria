/**
 * @layer integration
 * @module api/auth/login
 * Testes de integração das camadas de segurança do login admin.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/login/route";
import { prisma } from "@/lib/prisma";
import { LOGIN_SECURITY } from "@/lib/login-security";
import { resetDatabase, seedAdmin } from "../helpers/db";

function loginRequest(
  email: string,
  password: string,
  ip = "192.0.2.10"
) {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify({ email, password }),
  });
}

describe("POST /api/auth/login — segurança", () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedAdmin();
  });

  it("autentica com credenciais válidas e normaliza e-mail", async () => {
    const response = await POST(
      loginRequest("  TEST@padaria.com  ", "senha123")
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.admin.email).toBe("test@padaria.com");

    const cookie = response.cookies.get("admin_session");
    expect(cookie?.value).toBeTruthy();
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("strict");
  });

  it("rejeita credenciais inválidas com mensagem genérica", async () => {
    const response = await POST(
      loginRequest("test@padaria.com", "senha-errada")
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Credenciais inválidas");

    const attempts = await prisma.loginAttempt.count({
      where: { email: "test@padaria.com", success: false },
    });
    expect(attempts).toBe(1);
  });

  it("bloqueia após exceder tentativas por e-mail", async () => {
    for (let i = 0; i < LOGIN_SECURITY.maxEmailAttempts; i++) {
      const res = await POST(loginRequest("test@padaria.com", "errada"));
      expect(res.status).toBe(401);
    }

    const blocked = await POST(loginRequest("test@padaria.com", "senha123"));
    const data = await blocked.json();

    expect(blocked.status).toBe(429);
    expect(data.error).toMatch(/muitas tentativas/i);
    expect(blocked.headers.get("Retry-After")).toBeTruthy();
  }, 15_000);

  it("bloqueia após exceder tentativas por IP", async () => {
    const ip = "192.0.2.99";

    for (let i = 0; i < LOGIN_SECURITY.maxIpAttempts; i++) {
      const res = await POST(
        loginRequest(`user${i}@test.com`, "errada", ip)
      );
      expect(res.status).toBe(401);
    }

    const blocked = await POST(
      loginRequest("test@padaria.com", "senha123", ip)
    );
    expect(blocked.status).toBe(429);
  }, 30_000);
});
