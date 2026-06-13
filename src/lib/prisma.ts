/**
 * Cliente Prisma singleton para acesso ao banco de dados.
 * Reutiliza a mesma instância em desenvolvimento para evitar conexões duplicadas no hot reload.
 */

import { PrismaClient } from "@prisma/client";

// --- Instância global (cache em dev) ---
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// --- Exportação do cliente configurado por ambiente ---
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
