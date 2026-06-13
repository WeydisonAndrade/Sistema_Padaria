"use client";

/**
 * Gráficos do dashboard admin: faturamento mensal, produto mais vendido
 * e ranking de produtos. Usa Recharts e só renderiza após montagem no cliente.
 */

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, Trophy, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { MonthlyRevenue, TopProduct } from "@/lib/dashboard";

// --- Tipos e constantes ---

interface DashboardChartsProps {
  monthlyRevenue: MonthlyRevenue[];
  topProducts: TopProduct[];
  bestSeller: TopProduct | null;
  currentMonthRevenue: number;
}

const BAR_COLORS = ["#8b2635", "#a83244", "#c45c26", "#c9a227", "#6b5344"];

// --- Tooltip customizado: faturamento mensal ---

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: MonthlyRevenue }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
      <p className="mb-1 font-semibold text-foreground">{label}</p>
      <p className="text-sm text-primary">{formatPrice(data.revenue)}</p>
      <p className="text-xs text-muted">{data.orders} pedido(s)</p>
    </div>
  );
}

// --- Tooltip customizado: ranking de produtos ---

function TopProductTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
      <p className="mb-1 font-semibold text-foreground">{label}</p>
      <p className="text-sm text-primary">{payload[0].value} unidade(s)</p>
    </div>
  );
}

export default function DashboardCharts({
  monthlyRevenue,
  topProducts,
  bestSeller,
  currentMonthRevenue,
}: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false);

  // --- Aguarda montagem no cliente (Recharts exige DOM) ---
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- Prepara dados truncados para o eixo Y do ranking ---
  const topProductsChart = topProducts.map((p) => ({
    name: p.name.length > 12 ? `${p.name.slice(0, 12)}…` : p.name,
    fullName: p.name,
    quantity: p.totalQuantity,
  }));

  // --- Placeholder enquanto não montou ---
  if (!mounted) {
    return (
      <div className="mb-8 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-[420px] rounded-2xl bg-secondary/50 lg:col-span-2" />
          <div className="h-[420px] rounded-2xl bg-secondary/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* --- Gráfico de faturamento mensal --- */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Faturamento Mensal
              </h2>
              <p className="text-sm text-muted">Últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {formatPrice(currentMonthRevenue)} este mês
              </span>
            </div>
          </div>
          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
              <BarChart data={monthlyRevenue} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d4b896" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b5344", fontSize: 12 }}
                  axisLine={{ stroke: "#d4b896" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b5344", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(139,38,53,0.06)" }} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {monthlyRevenue.map((_, index) => (
                    <Cell
                      key={`month-${index}`}
                      fill={index === monthlyRevenue.length - 1 ? "#8b2635" : "#c9a227"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- Card do produto mais vendido --- */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-gold" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Mais Vendido
            </h2>
          </div>

          {bestSeller ? (
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-primary/10">
                <Trophy className="h-10 w-10 text-gold" />
              </div>
              <p className="font-mono text-xs text-primary">{bestSeller.code}</p>
              <h3 className="mt-1 font-display text-xl font-bold text-foreground">
                {bestSeller.name}
              </h3>
              <p className="text-sm text-muted">{bestSeller.category}</p>

              <div className="mt-6 w-full space-y-3 rounded-xl bg-secondary/60 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted">
                    <ShoppingBag className="h-4 w-4" />
                    Unidades vendidas
                  </span>
                  <span className="font-bold text-foreground">
                    {bestSeller.totalQuantity}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Faturamento</span>
                  <span className="font-bold text-primary">
                    {formatPrice(bestSeller.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted">
              Sem dados de vendas ainda.
            </p>
          )}
        </div>
      </div>

      {/* --- Gráfico horizontal: top produtos por quantidade --- */}
      {topProductsChart.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-1 font-display text-lg font-bold text-foreground">
            Produtos Mais Vendidos
          </h2>
          <p className="mb-6 text-sm text-muted">Ranking por quantidade nos últimos 6 meses</p>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
              <BarChart
                data={topProductsChart}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#d4b896" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "#6b5344", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fill: "#6b5344", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<TopProductTooltip />} cursor={{ fill: "rgba(139,38,53,0.06)" }} />
                <Bar dataKey="quantity" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {topProductsChart.map((_, index) => (
                    <Cell key={`prod-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
