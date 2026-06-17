/**
 * @layer integration
 * @module sales
 * Testes de integração do registro de vendas com banco real.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { registerSale, SaleError } from "@/lib/sales";
import { resetDatabase, seedProduct } from "../helpers/db";

describe("registerSale (integração)", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("registra venda e debita estoque", async () => {
    const product = await seedProduct({ stockQuantity: 10, price: 6 });

    const results = await registerSale([{ productId: product.id, quantity: 3 }]);

    expect(results).toHaveLength(1);
    expect(results[0].sale.total).toBe(18);
    expect(results[0].product.stockQuantity).toBe(7);
  });

  it("rejeita venda sem itens", async () => {
    await expect(registerSale([])).rejects.toBeInstanceOf(SaleError);
  });

  it("rejeita quantidade inválida", async () => {
    const product = await seedProduct();
    await expect(
      registerSale([{ productId: product.id, quantity: 0 }])
    ).rejects.toThrow("quantidade");
  });

  it("rejeita estoque insuficiente", async () => {
    const product = await seedProduct({ stockQuantity: 2 });
    await expect(
      registerSale([{ productId: product.id, quantity: 5 }])
    ).rejects.toThrow("Estoque insuficiente");
  });

  it("rejeita produto inativo", async () => {
    const product = await seedProduct({ active: false });
    await expect(
      registerSale([{ productId: product.id, quantity: 1 }])
    ).rejects.toThrow("inativo");
  });
});
