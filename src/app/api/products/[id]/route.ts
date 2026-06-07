import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar produto" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const current = await prisma.product.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    if (body.code && body.code.trim().toUpperCase() !== current.code) {
      const duplicate = await prisma.product.findUnique({
        where: { code: body.code.trim().toUpperCase() },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "Já existe um produto com este código" },
          { status: 409 }
        );
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        code: body.code ? body.code.trim().toUpperCase() : current.code,
        name: body.name,
        category: body.category,
        price: parseFloat(body.price),
        stockQuantity: parseInt(body.stockQuantity ?? "0", 10) || 0,
        expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
        imageUrl: body.imageUrl || null,
        active: body.active !== false,
      },
    });

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar produto" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao excluir produto" },
      { status: 500 }
    );
  }
}
