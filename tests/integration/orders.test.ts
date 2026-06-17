/**
 * @layer integration
 * @module orders
 * Testes de integração de pedidos online e cancelamento com estoque.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { createOrder, OrderError, updateOrderStatus } from "@/lib/orders";
import { resetDatabase, seedProduct } from "../helpers/db";

describe("createOrder (integração)", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("cria pedido com número sequencial e debita estoque", async () => {
    const product = await seedProduct({ code: "ORD001", stockQuantity: 8, price: 10 });

    const order = await createOrder({
      customerName: "João Silva",
      customerPhone: "(11) 98888-7777",
      customerEmail: "joao@test.com",
      items: [{ productId: product.id, quantity: 2 }],
    });

    expect(order.orderNumber).toMatch(/^TP\d{8}-\d{4}$/);
    expect(order.total).toBe(20);
    expect(order.customerPhone).toBe("11988887777");
    expect(order.items).toHaveLength(1);

    const { prisma } = await import("@/lib/prisma");
    const stock = await prisma.product.findUnique({ where: { id: product.id } });
    expect(stock?.stockQuantity).toBe(6);
  });

  it("exige e-mail para pagamento Pix", async () => {
    const product = await seedProduct({ code: "ORD002" });
    await expect(
      createOrder({
        customerName: "Maria",
        customerPhone: "11999999999",
        customerEmail: "",
        items: [{ productId: product.id, quantity: 1 }],
      })
    ).rejects.toBeInstanceOf(OrderError);
  });
});

describe("updateOrderStatus (integração)", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("restaura estoque ao cancelar pedido", async () => {
    const product = await seedProduct({ code: "ORD003", stockQuantity: 10 });
    const order = await createOrder({
      customerName: "Ana",
      customerPhone: "11999999999",
      customerEmail: "ana@test.com",
      items: [{ productId: product.id, quantity: 4 }],
    });

    await updateOrderStatus(order.id, "CANCELLED");

    const { prisma } = await import("@/lib/prisma");
    const stock = await prisma.product.findUnique({ where: { id: product.id } });
    expect(stock?.stockQuantity).toBe(10);
  });
});
