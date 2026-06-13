import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registerSale, SaleError } from "@/lib/sales";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const sales = await prisma.sale.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: { code: true, name: true, category: true },
        },
      },
    });

    return NextResponse.json(sales);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar vendas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    const items =
      body.items ??
      (body.productId
        ? [{ productId: body.productId, quantity: parseInt(body.quantity, 10) }]
        : []);

    const results = await registerSale(items);

    const total = results.reduce((sum, r) => sum + r.sale.total, 0);

    return NextResponse.json(
      {
        success: true,
        message: "Venda registrada e estoque atualizado.",
        total,
        sales: results,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SaleError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Erro ao registrar venda" },
      { status: 500 }
    );
  }
}
