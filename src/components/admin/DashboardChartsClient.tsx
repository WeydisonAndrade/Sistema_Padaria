"use client";

import dynamic from "next/dynamic";
import type { MonthlyRevenue, TopProduct } from "@/lib/dashboard";

const DashboardCharts = dynamic(() => import("@/components/admin/DashboardCharts"), {
  ssr: false,
  loading: () => (
    <div className="mb-8 space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-[420px] animate-pulse rounded-2xl bg-secondary/80 lg:col-span-2" />
        <div className="h-[420px] animate-pulse rounded-2xl bg-secondary/80" />
      </div>
    </div>
  ),
});

interface DashboardChartsClientProps {
  monthlyRevenue: MonthlyRevenue[];
  topProducts: TopProduct[];
  bestSeller: TopProduct | null;
  currentMonthRevenue: number;
}

export default function DashboardChartsClient(props: DashboardChartsClientProps) {
  return <DashboardCharts {...props} />;
}
