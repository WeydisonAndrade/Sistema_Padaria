"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Loader2 } from "lucide-react";
import {
  formatPrice,
  formatDate,
  getOrderStatusLabel,
  getOrderStatusColor,
} from "@/lib/utils";
import type { Order } from "@/types";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "CANCELLED", label: "Cancelado" },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();
  }, [router]);

  async function loadOrders() {
    setLoading(true);
    const authRes = await fetch("/api/auth/me");
    if (!authRes.ok) {
      router.push("/admin/login");
      return;
    }

    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function handleStatusChange(orderId: string, status: string) {
    setUpdatingId(orderId);
    setError("");

    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erro ao atualizar pedido.");
      setUpdatingId(null);
      return;
    }

    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? data : order))
    );
    setUpdatingId(null);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Pedidos Online
        </h1>
        <p className="text-muted">
          Pedidos feitos pelos clientes pelo site. Ao cancelar, o estoque é restaurado.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center shadow-sm">
          <Package className="mx-auto mb-4 h-10 w-10 text-muted" />
          <p className="text-muted">Nenhum pedido registrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-lg font-bold text-primary">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-muted">
                    {order.customerName} · {order.customerPhone}
                  </p>
                  <p className="text-xs text-muted">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getOrderStatusColor(order.status)}`}
                  >
                    {getOrderStatusLabel(order.status)}
                  </span>
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4 divide-y divide-border rounded-xl border border-border bg-secondary/30">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-2.5 text-sm"
                  >
                    <span>
                      {item.quantity}x {item.product?.name ?? "Produto"}{" "}
                      <span className="text-muted">({item.product?.code})</span>
                    </span>
                    <span className="font-medium">{formatPrice(item.total)}</span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <p className="mb-3 text-sm text-muted">
                  <span className="font-medium text-foreground">Obs:</span>{" "}
                  {order.notes}
                </p>
              )}

              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="font-semibold">Total</span>
                <span className="font-display text-xl font-bold text-primary">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
