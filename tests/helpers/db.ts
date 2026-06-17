/**
 * Helpers de banco para testes de integração — seed e limpeza entre casos.
 */
import { prisma } from "@/lib/prisma";

export async function resetDatabase() {
  await prisma.loginAttempt.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.admin.deleteMany();
}

export async function seedProduct(overrides: Partial<{
  code: string;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  active: boolean;
}> = {}) {
  return prisma.product.create({
    data: {
      code: overrides.code ?? "TST001",
      name: overrides.name ?? "Pão de Teste",
      category: overrides.category ?? "Pães",
      price: overrides.price ?? 5.5,
      stockQuantity: overrides.stockQuantity ?? 10,
      active: overrides.active ?? true,
    },
  });
}

export async function seedAdmin() {
  const bcrypt = await import("bcryptjs");
  return prisma.admin.upsert({
    where: { email: "test@padaria.com" },
    update: {},
    create: {
      email: "test@padaria.com",
      password: await bcrypt.hash("senha123", 10),
      name: "Admin Teste",
    },
  });
}
