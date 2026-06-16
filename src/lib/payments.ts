/**
 * Sincronização de pagamentos Pix com pedidos do banco.
 *
 * Usado em dois momentos:
 * 1. Webhook do Mercado Pago (notificação automática)
 * 2. Polling na página de confirmação (cliente clica "Já paguei")
 *
 * Ao confirmar pagamento: pedido → CONFIRMED / PAID
 * Ao expirar ou cancelar: pedido → CANCELLED e estoque restaurado
 */

import { prisma } from "@/lib/prisma";
import { getMercadoPagoPayment } from "@/lib/mercadopago";
import { updateOrderStatus, OrderError } from "@/lib/orders";

// --- Status internos de pagamento (campo Order.paymentStatus) ---
export type PaymentStatus = "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";

// --- Converte status da API do Mercado Pago para o domínio do sistema ---
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

/**
 * Sincroniza um pedido a partir do ID do pagamento no Mercado Pago.
 * Chamado pelo webhook e indiretamente pelo polling do cliente.
 */
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

  // Nada mudou — evita processamento desnecessário
  if (paymentStatus === order.paymentStatus) {
    return order;
  }

  // Atualiza apenas o status de pagamento
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus },
  });

  // Pagamento aprovado → confirma o pedido (mantém estoque reservado)
  if (paymentStatus === "PAID" && order.status !== "CONFIRMED") {
    return updateOrderStatus(orderId, "CONFIRMED");
  }

  // Pix expirado/cancelado → cancela pedido e devolve estoque
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

// --- Atalho: sincroniza pelo ID do pedido (usado na rota /api/orders/:id/payment) ---
export async function syncOrderPaymentByOrderId(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order?.mpPaymentId) {
    throw new OrderError("Pedido sem pagamento Pix associado.");
  }
  return syncOrderPaymentByMpId(order.mpPaymentId);
}
