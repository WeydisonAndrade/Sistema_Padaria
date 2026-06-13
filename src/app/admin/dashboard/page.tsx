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
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [dashboard, recentProducts] = await Promise.all([
    getDashboardData(),
    prisma.product.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

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
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Olá, {session.name}!
        </h1>
        <p className="text-muted">
          Visão geral da padaria · Faturamento total:{" "}
          <span className="font-semibold text-primary">
            {formatPrice(dashboard.summary.totalRevenue)}
          </span>
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`rounded-full p-2.5 ${stat.color}`}>
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

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-bold text-foreground">Produtos Recentes</h2>
          <Link
            href="/admin/produtos"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
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
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-sm text-muted">
                    {product.code} · {product.category}
                  </p>
                </div>
                <div className="text-right">
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
          <p className="px-6 py-8 text-center text-muted">
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
