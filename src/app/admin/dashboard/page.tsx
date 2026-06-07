import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, getProductStatusLabel } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [totalProducts, activeProducts, inactiveProducts, recentProducts] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.product.count({ where: { active: false } }),
      prisma.product.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
      }),
    ]);

  const stats = [
    {
      label: "Total de Produtos",
      value: totalProducts,
      icon: Package,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Ativos",
      value: activeProducts,
      icon: CheckCircle,
      color: "bg-green-100 text-green-700",
    },
    {
      label: "Inativos",
      value: inactiveProducts,
      icon: XCircle,
      color: "bg-red-100 text-red-700",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Olá, {session.name}!
        </h1>
        <p className="text-muted">Bem-vindo ao painel administrativo</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-full p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
