import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const availableOnly = searchParams.get("available") !== "false";

    const products = await prisma.product.findMany({
      where: {
        ...(category && category !== "Todos" ? { category } : {}),
        ...(availableOnly ? { available: true } : {}),
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

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, category, imageUrl, weight, ingredients, available } =
      body;

    if (!name || !description || price === undefined || !category) {
      return NextResponse.json(
        { error: "Campos obrigatórios: nome, descrição, preço e categoria" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        imageUrl: imageUrl || null,
        weight: weight || null,
        ingredients: ingredients || null,
        available: available !== false,
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
