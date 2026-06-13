/**
 * Middleware de proteção das rotas administrativas.
 * Verifica o cookie JWT de sessão e redireciona para login ou dashboard conforme o caso.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "@/lib/jwt-secret";

// --- Validação do token JWT da sessão do admin ---
async function isValidSession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("admin_session")?.value;

  // --- Rota de login: redireciona para dashboard se já autenticado ---
  if (pathname === "/admin/login") {
    if (token && (await isValidSession(token))) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // --- Demais rotas /admin: exige sessão válida ---
  if (!token || !(await isValidSession(token))) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

// --- Rotas protegidas pelo middleware ---
export const config = {
  matcher: ["/admin/:path*"],
};
