/**
 * @layer unit
 * @module dashboard
 * Testes unitários das agregações do painel admin (mock Prisma + data fixa).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { count: vi.fn() },
    sale: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/lib/dashboard";

const mockProductCount = vi.mocked(prisma.product.count);
const mockSaleFindMany = vi.mocked(prisma.sale.findMany);

/** Data de referência: 15/06/2025 — janela de 6 meses: Jan–Jun/25 */
const FIXED_NOW = new Date("2025-06-15T12:00:00");

function mockProduct(overrides: Partial<{
  id: string;
  code: string;
  name: string;
  category: string;
}> = {}) {
  return {
    id: overrides.id ?? "prod-1",
    code: overrides.code ?? "PAO001",
    name: overrides.name ?? "Pão Francês",
    category: overrides.category ?? "Pães",
    imageUrl: null,
  };
}

function mockSale(input: {
  id?: string;
  productId?: string;
  product?: ReturnType<typeof mockProduct>;
  quantity?: number;
  total?: number;
  createdAt: Date;
}) {
  const product = input.product ?? mockProduct({ id: input.productId ?? "prod-1" });
  return {
    id: input.id ?? `sale-${input.createdAt.getTime()}`,
    productId: product.id,
    quantity: input.quantity ?? 1,
    unitPrice: input.total ?? 10,
    total: input.total ?? 10,
    createdAt: input.createdAt,
    product,
  };
}

function setupProductCounts(total: number, active: number, inactive: number) {
  mockProductCount.mockImplementation(async (args) => {
    const where = args?.where as { active?: boolean } | undefined;
    if (where?.active === true) return active;
    if (where?.active === false) return inactive;
    return total;
  });
}

describe("getDashboardData", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
    vi.clearAllMocks();
    setupProductCounts(10, 8, 2);
    mockSaleFindMany.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retorna contagem de produtos do banco", async () => {
    const data = await getDashboardData();

    expect(data.summary.totalProducts).toBe(10);
    expect(data.summary.activeProducts).toBe(8);
    expect(data.summary.inactiveProducts).toBe(2);
  });

  it("inicializa 6 buckets mensais (Jan a Jun/25) sem vendas", async () => {
    const data = await getDashboardData();

    expect(data.monthlyRevenue).toHaveLength(6);
    expect(data.monthlyRevenue.map((b) => b.month)).toEqual([
      "Jan/25",
      "Fev/25",
      "Mar/25",
      "Abr/25",
      "Mai/25",
      "Jun/25",
    ]);
    expect(data.summary.totalRevenue).toBe(0);
    expect(data.summary.currentMonthRevenue).toBe(0);
    expect(data.topProducts).toEqual([]);
    expect(data.bestSeller).toBeNull();
  });

  it("soma faturamento total e do mês atual", async () => {
    mockSaleFindMany.mockResolvedValue([
      mockSale({ total: 30, createdAt: new Date("2025-06-05"), quantity: 3 }),
      mockSale({ total: 20, createdAt: new Date("2025-06-12"), quantity: 2 }),
      mockSale({ total: 15, createdAt: new Date("2025-05-20"), quantity: 1 }),
    ] as never);

    const data = await getDashboardData();

    expect(data.summary.totalRevenue).toBe(65);
    expect(data.summary.currentMonthRevenue).toBe(50);
    expect(data.summary.currentMonthOrders).toBe(2);
  });

  it("distribui vendas nos buckets mensais corretos", async () => {
    mockSaleFindMany.mockResolvedValue([
      mockSale({ total: 40, createdAt: new Date("2025-06-10") }),
      mockSale({ total: 25, createdAt: new Date("2025-05-08") }),
      mockSale({ total: 10, createdAt: new Date("2025-03-15") }),
    ] as never);

    const data = await getDashboardData();

    const june = data.monthlyRevenue.find((b) => b.month === "Jun/25");
    const may = data.monthlyRevenue.find((b) => b.month === "Mai/25");
    const march = data.monthlyRevenue.find((b) => b.month === "Mar/25");

    expect(june?.revenue).toBe(40);
    expect(june?.orders).toBe(1);
    expect(may?.revenue).toBe(25);
    expect(march?.revenue).toBe(10);
  });

  it("agrega quantidade e faturamento por produto", async () => {
    mockSaleFindMany.mockResolvedValue([
      mockSale({
        product: mockProduct({ id: "p1", code: "A", name: "Croissant" }),
        quantity: 2,
        total: 16,
        createdAt: new Date("2025-06-01"),
      }),
      mockSale({
        product: mockProduct({ id: "p1", code: "A", name: "Croissant" }),
        quantity: 3,
        total: 24,
        createdAt: new Date("2025-06-08"),
      }),
      mockSale({
        product: mockProduct({ id: "p2", code: "B", name: "Pão de Forma" }),
        quantity: 6,
        total: 36,
        createdAt: new Date("2025-06-03"),
      }),
    ] as never);

    const data = await getDashboardData();

    expect(data.topProducts).toHaveLength(2);
    expect(data.bestSeller?.code).toBe("B");
    expect(data.bestSeller?.totalQuantity).toBe(6);

    const croissant = data.topProducts.find((p) => p.code === "A");
    expect(croissant?.totalQuantity).toBe(5);
    expect(croissant?.totalRevenue).toBe(40);
  });

  it("limita ranking a 5 produtos", async () => {
    const sales = Array.from({ length: 6 }, (_, i) =>
      mockSale({
        product: mockProduct({
          id: `p${i}`,
          code: `C${i}`,
          name: `Produto ${i}`,
        }),
        quantity: 6 - i,
        total: (6 - i) * 10,
        createdAt: new Date("2025-06-10"),
      })
    );

    mockSaleFindMany.mockResolvedValue(sales as never);

    const data = await getDashboardData();

    expect(data.topProducts).toHaveLength(5);
    expect(data.topProducts[0].code).toBe("C0");
    expect(data.topProducts[4].code).toBe("C4");
  });

  it("consulta vendas dos últimos 6 meses no Prisma", async () => {
    await getDashboardData();

    expect(mockSaleFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { createdAt: { gte: new Date("2025-01-01T00:00:00") } },
        include: { product: true },
        orderBy: { createdAt: "asc" },
      })
    );
  });
});
