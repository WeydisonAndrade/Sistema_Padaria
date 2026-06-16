/**
 * Webhook do Mercado Pago para atualizar status de pagamentos Pix.
 *
 * Configure no painel MP: https://seu-dominio.com/api/webhooks/mercadopago
 * Eventos: payment (criação e atualização)
 *
 * O MP envia o ID do pagamento; consultamos a API para obter o status real.
 */

import { NextRequest, NextResponse } from "next/server";
import { syncOrderPaymentByMpId } from "@/lib/payments";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // MP pode enviar dados na query string ou no corpo JSON
    const topic =
      request.nextUrl.searchParams.get("topic") ??
      request.nextUrl.searchParams.get("type") ??
      body.type;

    const paymentId =
      request.nextUrl.searchParams.get("id") ??
      request.nextUrl.searchParams.get("data.id") ??
      body?.data?.id;

    if (topic === "payment" && paymentId) {
      await syncOrderPaymentByMpId(String(paymentId));
    }

    return NextResponse.json({ received: true });
  } catch {
    // Sempre 200: o MP reenvia notificações se receber erro
    return NextResponse.json({ received: true });
  }
}
