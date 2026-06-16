/**
 * Rota de polling do pagamento Pix de um pedido.
 *
 * Chamada pela página de confirmação quando o cliente paga ou clica
 * "Já paguei — verificar agora". Consulta o Mercado Pago e atualiza o pedido.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncOrderPaymentByOrderId } from "@/lib/payments";
import { OrderError } from "@/lib/orders";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const phone = String(body.phone ?? "").replace(/\D/g, "");

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    // Cliente só acessa com telefone correto; admin acessa via sessão
    const session = await getSession();
    if (!session && phone !== order.customerPhone) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    const updated = await syncOrderPaymentByOrderId(id);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao verificar pagamento" },
      { status: 500 }
    );
  }
}
