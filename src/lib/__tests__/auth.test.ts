/**
 * @layer unit
 * @module auth
 * Testes unitários de criação e verificação de sessão JWT.
 */
import { describe, expect, it } from "vitest";
import { createSession, verifySession } from "@/lib/auth";

describe("auth / JWT", () => {
  const payload = {
    adminId: "admin-1",
    email: "admin@padaria.com",
    name: "Administrador",
  };

  it("cria token válido e recupera o payload", async () => {
    const token = await createSession(payload);
    expect(token).toBeTruthy();

    const session = await verifySession(token);
    expect(session).toMatchObject(payload);
  });

  it("retorna null para token inválido", async () => {
    const session = await verifySession("token.invalido");
    expect(session).toBeNull();
  });

  it("retorna null para token adulterado", async () => {
    const token = await createSession(payload);
    const tampered = `${token}x`;
    expect(await verifySession(tampered)).toBeNull();
  });
});
