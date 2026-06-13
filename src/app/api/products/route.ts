/**
 * CRUD de produtos (listagem pública e criação restrita ao admin).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// --- GET: lista produtos com filtros opcionais de categoria e ativo ---
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const activeOnly = searchParams.get("active") !== "false";

    const products = await prisma.product.findMany({
      where: {
        ...(category && category !== "Todos" ? { category } : {}),
        ...(activeOnly ? { active: true } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}

// --- POST: cria produto (requer sessão admin) ---
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { code, name, category, price, stockQuantity, expirationDate, imageUrl, active } =
      body;

    if (!code || !name || !category || price === undefined || price === "") {
      return NextResponse.json(
        { error: "Campos obrigatórios: código, nome, categoria e preço de venda" },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: "Já existe um produto com este código" },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: {
        code: code.trim().toUpperCase(),
        name,
        category,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity ?? "0", 10) || 0,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        imageUrl: imageUrl || null,
        active: active !== false,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}
