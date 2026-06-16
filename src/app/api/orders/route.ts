/**
 * Pedidos online: listagem (admin ou cliente por telefone) e criação pública.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrder, updateOrderStatus, OrderError } from "@/lib/orders";
import { createPixPayment } from "@/lib/mercadopago";

const orderInclude = {
  items: {
    include: {
      product: {
        select: { code: true, name: true, category: true },
      },
    },
  },
} as const;

// --- GET: lista pedidos (admin vê todos; cliente filtra por telefone) ---
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone")?.replace(/\D/g, "");
    const session = await getSession();

    if (session) {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
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
      return NextResponse.json(orders);
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Informe o telefone para consultar pedidos." },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { customerPhone: phone },
      orderBy: { createdAt: "desc" },
      take: 20,
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

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar pedidos" },
      { status: 500 }
    );
  }
}

// --- POST: cria pedido e gera cobrança Pix no Mercado Pago ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const order = await createOrder({
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      notes: body.notes,
      items: body.items ?? [],
    });

    try {
      const pix = await createPixPayment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.total,
        customerName: order.customerName,
        customerEmail: order.customerEmail!,
      });

      const orderWithPix = await prisma.order.update({
        where: { id: order.id },
        data: {
          mpPaymentId: pix.mpPaymentId,
          pixQrCode: pix.pixQrCode,
          pixQrCodeBase64: pix.pixQrCodeBase64,
          pixExpiresAt: pix.pixExpiresAt,
        },
        include: orderInclude,
      });

      return NextResponse.json(orderWithPix, { status: 201 });
    } catch (pixError) {
      await updateOrderStatus(order.id, "CANCELLED");
      const message =
        pixError instanceof Error
          ? pixError.message
          : "Erro ao gerar pagamento Pix.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao criar pedido" },
      { status: 500 }
    );
  }
}
