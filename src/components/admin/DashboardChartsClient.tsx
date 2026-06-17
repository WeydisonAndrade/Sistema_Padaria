"use client";

/**
 * Wrapper client-side que carrega os gráficos do dashboard de forma dinâmica,
 * exibindo skeleton de loading enquanto o bundle é baixado.
 */

import dynamic from "next/dynamic";
import type { MonthlyRevenue, TopProduct } from "@/lib/dashboard";

// --- Importação dinâmica com fallback de carregamento ---

const DashboardCharts = dynamic(() => import("@/components/admin/DashboardCharts"), {
  ssr: false,
  loading: () => (
    <div className="mb-6 space-y-4 sm:mb-8 sm:space-y-6">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="h-80 animate-pulse rounded-2xl bg-secondary/80 sm:h-[420px] lg:col-span-2" />
        <div className="h-80 animate-pulse rounded-2xl bg-secondary/80 sm:h-[420px]" />
      </div>
    </div>
  ),
});

// --- Tipos ---

interface DashboardChartsClientProps {
  monthlyRevenue: MonthlyRevenue[];
  topProducts: TopProduct[];
  bestSeller: TopProduct | null;
  currentMonthRevenue: number;
}

export default function DashboardChartsClient(props: DashboardChartsClientProps) {
  return <DashboardCharts {...props} />;
}
