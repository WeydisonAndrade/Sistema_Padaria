/**
 * Sincronização de pagamentos Pix com pedidos (webhook e polling).
 */

import { prisma } from "@/lib/prisma";
import { getMercadoPagoPayment } from "@/lib/mercadopago";
import { updateOrderStatus, OrderError } from "@/lib/orders";

export type PaymentStatus = "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";

// --- Mapeia status do Mercado Pago para o domínio interno ---
function mapMercadoPagoStatus(mpStatus: string | undefined): PaymentStatus {
  switch (mpStatus) {
    case "approved":
      return "PAID";
    case "cancelled":
    case "rejected":
      return "CANCELLED";
    case "expired":
      return "EXPIRED";
    default:
      return "PENDING";
  }
}

// --- Atualiza pedido conforme status do pagamento ---
export async function syncOrderPaymentByMpId(mpPaymentId: string) {
  const mpPayment = await getMercadoPagoPayment(mpPaymentId);
  const orderId = mpPayment.external_reference;

  if (!orderId) {
    throw new OrderError("Pagamento sem referência de pedido.");
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new OrderError("Pedido não encontrado para o pagamento.");
  }

  const paymentStatus = mapMercadoPagoStatus(mpPayment.status);

  if (paymentStatus === order.paymentStatus) {
    return order;
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus },
  });

  if (paymentStatus === "PAID" && order.status !== "CONFIRMED") {
    return updateOrderStatus(orderId, "CONFIRMED");
  }

  if (
    (paymentStatus === "CANCELLED" || paymentStatus === "EXPIRED") &&
    order.status !== "CANCELLED"
  ) {
    return updateOrderStatus(orderId, "CANCELLED");
  }

  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: { code: true, name: true, category: true },
          },
        },
      },
    },
  });
}

// --- Sincroniza pagamento de um pedido existente ---
export async function syncOrderPaymentByOrderId(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order?.mpPaymentId) {
    throw new OrderError("Pedido sem pagamento Pix associado.");
  }
  return syncOrderPaymentByMpId(order.mpPaymentId);
}
