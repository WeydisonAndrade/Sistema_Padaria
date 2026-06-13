/**
 * Pedidos online: listagem (admin ou cliente por telefone) e criação pública.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrder, OrderError } from "@/lib/orders";

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

// --- POST: cria novo pedido a partir do checkout do cliente ---
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

    return NextResponse.json(order, { status: 201 });
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
