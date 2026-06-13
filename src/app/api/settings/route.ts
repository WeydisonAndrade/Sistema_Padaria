/**
 * Configurações da padaria: leitura pública e atualização pelo admin.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// --- GET: retorna configurações (cria registro padrão se não existir) ---
export async function GET() {
  try {
    let settings = await prisma.bakerySettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.bakerySettings.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}

// --- PUT: atualiza ou cria configurações (requer sessão admin) ---
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();

    const settings = await prisma.bakerySettings.upsert({
      where: { id: "default" },
      update: {
        name: body.name,
        description: body.description,
        address: body.address,
        phone: body.phone,
        whatsapp: body.whatsapp,
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        openingHours: body.openingHours,
      },
      create: {
        id: "default",
        name: body.name,
        description: body.description,
        address: body.address,
        phone: body.phone,
        whatsapp: body.whatsapp,
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        openingHours: body.openingHours,
      },
    });

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar configurações" },
      { status: 500 }
    );
  }
}
