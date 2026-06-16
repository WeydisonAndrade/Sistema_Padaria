/**
 * Webhook do Mercado Pago para atualizar status de pagamentos Pix.
 */

import { NextRequest, NextResponse } from "next/server";
import { syncOrderPaymentByMpId } from "@/lib/payments";

// --- POST: notificação de pagamento (payment.created / payment.updated) ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    // Mercado Pago reenvia notificações; respondemos 200 para evitar retentativas em loop
    return NextResponse.json({ received: true });
  }
}
