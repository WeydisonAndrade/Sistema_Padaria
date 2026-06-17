/**
 * Dashboard do painel administrativo.
 * Exibe métricas de faturamento, gráficos, resumo de produtos e lista dos mais recentes.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package,
  CheckCircle,
  XCircle,
  ArrowRight,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/lib/dashboard";
import DashboardChartsClient from "@/components/admin/DashboardChartsClient";
import { formatPrice, getProductStatusLabel } from "@/lib/utils";

export default async function AdminDashboardPage() {
  // --- Verificação de sessão: redireciona se não autenticado ---
  const session = await getSession();
  if (!session) redirect("/admin/login");

  // --- Carregamento paralelo: métricas do dashboard e produtos recentes ---
  const [dashboard, recentProducts] = await Promise.all([
    getDashboardData(),
    prisma.product.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  // --- Cards de estatísticas exibidos no topo da página ---
  const stats = [
    {
      label: "Faturamento do Mês",
      value: formatPrice(dashboard.summary.currentMonthRevenue),
      icon: DollarSign,
      color: "bg-gold/20 text-gold",
    },
    {
      label: "Pedidos do Mês",
      value: dashboard.summary.currentMonthOrders,
      icon: ShoppingCart,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Total de Produtos",
      value: dashboard.summary.totalProducts,
      icon: Package,
      color: "bg-secondary text-foreground",
    },
    {
      label: "Produtos Ativos",
      value: dashboard.summary.activeProducts,
      icon: CheckCircle,
      color: "bg-green-100 text-green-700",
    },
    {
      label: "Produtos Inativos",
      value: dashboard.summary.inactiveProducts,
      icon: XCircle,
      color: "bg-red-100 text-red-700",
    },
  ];

  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">
          Olá, {session.name}!
        </h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          Visão geral da padaria
          <span className="mt-1 block sm:mt-0 sm:inline">
            {" "}
            · Faturamento total:{" "}
            <span className="font-semibold text-primary">
              {formatPrice(dashboard.summary.totalRevenue)}
            </span>
          </span>
        </p>
      </div>

      {/* --- Cards de métricas: 1 coluna no mobile, 2 no tablet, 5 no desktop --- */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted">{stat.label}</p>
                  <p className="mt-1 break-words text-xl font-bold text-foreground sm:text-2xl">
                    {stat.value}
                  </p>
                </div>
                <div className={`shrink-0 rounded-full p-2.5 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <DashboardChartsClient
        monthlyRevenue={dashboard.monthlyRevenue}
        topProducts={dashboard.topProducts}
        bestSeller={dashboard.bestSeller}
        currentMonthRevenue={dashboard.summary.currentMonthRevenue}
      />

      {/* --- Lista de produtos recentes --- */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="font-bold text-foreground">Produtos Recentes</h2>
          <Link
            href="/admin/produtos"
            className="flex shrink-0 items-center gap-1 text-sm text-primary hover:underline"
          >
            Gerenciar
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentProducts.length > 0 ? (
          <div className="divide-y divide-border">
            {recentProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{product.name}</p>
                  <p className="text-sm text-muted">
                    {product.code} · {product.category}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                  <p className="font-medium text-primary">
                    {formatPrice(product.price)}
                  </p>
                  <span
                    className={`text-xs ${
                      product.active ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {getProductStatusLabel(product.active)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-4 py-8 text-center text-muted sm:px-6">
            Nenhum produto cadastrado.{" "}
            <Link href="/admin/produtos" className="text-primary hover:underline">
              Adicionar produto
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
