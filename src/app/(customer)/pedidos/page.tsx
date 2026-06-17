/**
 * Página de consulta de pedidos do cliente.
 * Busca pedidos pelo telefone e exibe status do pedido e do pagamento Pix.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Package, Loader2 } from "lucide-react";
import {
  formatPrice,
  formatDate,
  getOrderStatusLabel,
  getOrderStatusColor,
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from "@/lib/utils";
import PageHero from "@/components/PageHero";
import type { Order } from "@/types";

export default function OrdersPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Busca pedidos na API pelo telefone (apenas dígitos) ---
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSearched(true);

    try {
      const digits = phone.replace(/\D/g, "");
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(digits)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao buscar pedidos.");
        setOrders([]);
        setLoading(false);
        return;
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setOrders([]);
    }

    setLoading(false);
  }

  return (
    <>
      <PageHero
        title="Meus Pedidos"
        subtitle="Consulte o status dos seus pedidos pelo telefone"
      />

      <div className="mx-auto max-w-2xl px-4 py-12">
        <form
          onSubmit={handleSearch}
          className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <label htmlFor="phone" className="mb-2 block text-sm font-medium">
            Telefone usado no pedido
          </label>
          <div className="flex gap-3">
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="(11) 99999-9999"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Buscar
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {searched && !loading && orders.length === 0 && !error && (
          <div className="py-12 text-center">
            <Package className="mx-auto mb-4 h-10 w-10 text-muted" />
            <p className="text-muted">Nenhum pedido encontrado para este telefone.</p>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/pedidos/confirmacao/${order.id}?phone=${encodeURIComponent(order.customerPhone)}`}
              className="block rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-sm font-semibold text-primary">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-muted">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                {/* --- Badges: status do pagamento Pix e do pedido --- */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}
                  >
                    {getPaymentStatusLabel(order.paymentStatus)}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getOrderStatusColor(order.status)}`}
                  >
                    {getOrderStatusLabel(order.status)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">
                  {order.items.length} item(ns)
                </p>
                <p className="font-display text-lg font-bold text-primary">
                  {formatPrice(order.total)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
