/**
 * Verificação de sessão: retorna se o admin está autenticado e seus dados.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// --- GET: consulta sessão atual via cookie ---
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, admin: session });
}
