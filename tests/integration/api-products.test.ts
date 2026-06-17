/**
 * @layer integration
 * @module api/products
 * Testes de integração da rota GET /api/products.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/products/route";
import { resetDatabase, seedProduct } from "../helpers/db";

describe("GET /api/products", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("retorna lista vazia quando não há produtos", async () => {
    const response = await GET(new NextRequest("http://localhost/api/products"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
  });

  it("retorna apenas produtos ativos por padrão", async () => {
    await seedProduct({ code: "API001", active: true });
    await seedProduct({ code: "API002", active: false, name: "Inativo" });

    const response = await GET(new NextRequest("http://localhost/api/products"));
    const data = await response.json();

    expect(data).toHaveLength(1);
    expect(data[0].code).toBe("API001");
  });

  it("filtra por categoria", async () => {
    await seedProduct({ code: "API003", category: "Pães" });
    await seedProduct({ code: "API004", category: "Bolos", name: "Bolo" });

    const response = await GET(
      new NextRequest("http://localhost/api/products?category=Bolos")
    );
    const data = await response.json();

    expect(data).toHaveLength(1);
    expect(data[0].category).toBe("Bolos");
  });
});
