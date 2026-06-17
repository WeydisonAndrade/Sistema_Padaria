/**
 * @layer integration
 * @module payments
 * Testes de integração da sincronização Pix com mock do Mercado Pago.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetDatabase, seedProduct } from "../helpers/db";

vi.mock("@/lib/mercadopago", () => ({
  getMercadoPagoPayment: vi.fn(),
}));

import { getMercadoPagoPayment } from "@/lib/mercadopago";
import { syncOrderPaymentByMpId, syncOrderPaymentByOrderId } from "@/lib/payments";
import { createOrder, OrderError } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

const mockGetPayment = vi.mocked(getMercadoPagoPayment);

async function createTestOrder() {
  const product = await seedProduct({
    code: "PAY001",
    stockQuantity: 10,
    price: 15,
  });

  const order = await createOrder({
    customerName: "Cliente Pix",
    customerPhone: "11999998888",
    customerEmail: "pix@test.com",
    items: [{ productId: product.id, quantity: 2 }],
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { mpPaymentId: "mp-payment-001" },
  });

  return { order, product };
}

describe("syncOrderPaymentByMpId (integração)", () => {
  beforeEach(async () => {
    await resetDatabase();
    vi.clearAllMocks();
  });

  it("confirma pedido quando pagamento é aprovado", async () => {
    const { order } = await createTestOrder();

    mockGetPayment.mockResolvedValue({
      status: "approved",
      external_reference: order.id,
    } as Awaited<ReturnType<typeof getMercadoPagoPayment>>);

    const result = await syncOrderPaymentByMpId("mp-payment-001");

    expect(result?.paymentStatus).toBe("PAID");
    expect(result?.status).toBe("CONFIRMED");
    expect(mockGetPayment).toHaveBeenCalledWith("mp-payment-001");
  });

  it("cancela pedido e restaura estoque quando pagamento é rejeitado", async () => {
    const { order, product } = await createTestOrder();

    mockGetPayment.mockResolvedValue({
      status: "rejected",
      external_reference: order.id,
    } as Awaited<ReturnType<typeof getMercadoPagoPayment>>);

    await syncOrderPaymentByMpId("mp-payment-001");

    const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    const stock = await prisma.product.findUnique({ where: { id: product.id } });

    expect(updatedOrder?.paymentStatus).toBe("CANCELLED");
    expect(updatedOrder?.status).toBe("CANCELLED");
    expect(stock?.stockQuantity).toBe(10);
  });

  it("cancela pedido quando Pix expira", async () => {
    const { order } = await createTestOrder();

    mockGetPayment.mockResolvedValue({
      status: "expired",
      external_reference: order.id,
    } as Awaited<ReturnType<typeof getMercadoPagoPayment>>);

    const result = await syncOrderPaymentByMpId("mp-payment-001");

    expect(result?.paymentStatus).toBe("EXPIRED");
    expect(result?.status).toBe("CANCELLED");
  });

  it("mantém pendente quando MP ainda processa", async () => {
    const { order } = await createTestOrder();

    mockGetPayment.mockResolvedValue({
      status: "pending",
      external_reference: order.id,
    } as Awaited<ReturnType<typeof getMercadoPagoPayment>>);

    const result = await syncOrderPaymentByMpId("mp-payment-001");

    expect(result?.paymentStatus).toBe("PENDING");
    expect(result?.status).toBe("PENDING");
  });

  it("é idempotente quando status não mudou", async () => {
    const { order } = await createTestOrder();

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID", status: "CONFIRMED" },
    });

    mockGetPayment.mockResolvedValue({
      status: "approved",
      external_reference: order.id,
    } as Awaited<ReturnType<typeof getMercadoPagoPayment>>);

    const result = await syncOrderPaymentByMpId("mp-payment-001");

    expect(result?.paymentStatus).toBe("PAID");
    expect(result?.status).toBe("CONFIRMED");
    expect(mockGetPayment).toHaveBeenCalledTimes(1);
  });

  it("rejeita pagamento sem referência de pedido", async () => {
    mockGetPayment.mockResolvedValue({
      status: "approved",
      external_reference: undefined,
    } as Awaited<ReturnType<typeof getMercadoPagoPayment>>);

    await expect(syncOrderPaymentByMpId("mp-invalid")).rejects.toBeInstanceOf(
      OrderError
    );
  });

  it("rejeita quando pedido não existe", async () => {
    mockGetPayment.mockResolvedValue({
      status: "approved",
      external_reference: "pedido-inexistente",
    } as Awaited<ReturnType<typeof getMercadoPagoPayment>>);

    await expect(syncOrderPaymentByMpId("mp-orphan")).rejects.toThrow(
      "Pedido não encontrado"
    );
  });
});

describe("syncOrderPaymentByOrderId (integração)", () => {
  beforeEach(async () => {
    await resetDatabase();
    vi.clearAllMocks();
  });

  it("sincroniza pelo mpPaymentId do pedido", async () => {
    const { order } = await createTestOrder();

    mockGetPayment.mockResolvedValue({
      status: "approved",
      external_reference: order.id,
    } as Awaited<ReturnType<typeof getMercadoPagoPayment>>);

    const result = await syncOrderPaymentByOrderId(order.id);

    expect(result?.paymentStatus).toBe("PAID");
    expect(mockGetPayment).toHaveBeenCalledWith("mp-payment-001");
  });

  it("rejeita pedido sem pagamento Pix associado", async () => {
    const product = await seedProduct({ code: "PAY002" });
    const order = await createOrder({
      customerName: "Sem Pix",
      customerPhone: "11988887777",
      customerEmail: "sem@test.com",
      items: [{ productId: product.id, quantity: 1 }],
    });

    await expect(syncOrderPaymentByOrderId(order.id)).rejects.toThrow(
      "sem pagamento Pix"
    );
  });
});
