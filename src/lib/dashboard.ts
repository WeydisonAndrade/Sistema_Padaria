/**
 * Agregação de métricas do painel admin: resumo de produtos,
 * receita mensal dos últimos 6 meses e produtos mais vendidos.
 */

import { prisma } from "@/lib/prisma";

// --- Rótulos de mês para exibição no gráfico ---
const MONTH_LABELS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

// --- Tipos retornados pelo dashboard ---
export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  code: string;
  name: string;
  category: string;
  imageUrl: string | null;
  totalQuantity: number;
  totalRevenue: number;
}

export interface DashboardData {
  summary: {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    currentMonthRevenue: number;
    currentMonthOrders: number;
    totalRevenue: number;
  };
  monthlyRevenue: MonthlyRevenue[];
  topProducts: TopProduct[];
  bestSeller: TopProduct | null;
}

// --- Helpers de chave e rótulo por mês ---
function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(date: Date): string {
  return `${MONTH_LABELS[date.getMonth()]}/${String(date.getFullYear()).slice(-2)}`;
}

// --- Montagem dos dados do dashboard ---
export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalProducts, activeProducts, inactiveProducts, sales] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({ where: { active: false } }),
    prisma.sale.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      include: { product: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const monthBuckets: MonthlyRevenue[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthBuckets.push({
      month: formatMonthLabel(date),
      revenue: 0,
      orders: 0,
    });
  }

  const monthIndexMap = new Map<string, number>();
  monthBuckets.forEach((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    monthIndexMap.set(getMonthKey(date), index);
  });

  let currentMonthRevenue = 0;
  let currentMonthOrders = 0;
  let totalRevenue = 0;

  const productStats = new Map<string, TopProduct>();

  for (const sale of sales) {
    totalRevenue += sale.total;

    const monthKey = getMonthKey(sale.createdAt);
    const bucketIndex = monthIndexMap.get(monthKey);
    if (bucketIndex !== undefined) {
      monthBuckets[bucketIndex].revenue += sale.total;
      monthBuckets[bucketIndex].orders += 1;
    }

    if (sale.createdAt >= currentMonthStart) {
      currentMonthRevenue += sale.total;
      currentMonthOrders += 1;
    }

    const existing = productStats.get(sale.productId);
    if (existing) {
      existing.totalQuantity += sale.quantity;
      existing.totalRevenue += sale.total;
    } else {
      productStats.set(sale.productId, {
        id: sale.product.id,
        code: sale.product.code,
        name: sale.product.name,
        category: sale.product.category,
        imageUrl: sale.product.imageUrl,
        totalQuantity: sale.quantity,
        totalRevenue: sale.total,
      });
    }
  }

  const topProducts = Array.from(productStats.values())
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5);

  return {
    summary: {
      totalProducts,
      activeProducts,
      inactiveProducts,
      currentMonthRevenue,
      currentMonthOrders,
      totalRevenue,
    },
    monthlyRevenue: monthBuckets,
    topProducts,
    bestSeller: topProducts[0] ?? null,
  };
}
