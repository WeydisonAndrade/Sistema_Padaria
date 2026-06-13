/**
 * Página de registro de vendas presenciais no admin.
 * Monta carrinho local, valida estoque e registra venda com baixa automática no banco.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Trash2, CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

// --- Tipos auxiliares do carrinho e histórico de vendas ---
interface CartItem {
  productId: string;
  quantity: number;
}

interface RecentSale {
  id: string;
  quantity: number;
  total: number;
  createdAt: string;
  product: { code: string; name: string; category: string };
}

export default function AdminSalesPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, [router]);

  // --- Carrega produtos ativos e vendas recentes (requer autenticação) ---
  async function loadData() {
    setLoading(true);
    const authRes = await fetch("/api/auth/me");
    if (!authRes.ok) {
      router.push("/admin/login");
      return;
    }

    const [productsRes, salesRes] = await Promise.all([
      fetch("/api/products?active=false"),
      fetch("/api/sales"),
    ]);

    const productsData = await productsRes.json();
    const salesData = await salesRes.json();

    setProducts(Array.isArray(productsData) ? productsData : []);
    setRecentSales(Array.isArray(salesData) ? salesData : []);
    setLoading(false);
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // --- Carrinho local: adicionar, remover e calcular total ---
  function addToCart() {
    setError("");
    if (!selectedProductId) {
      setError("Selecione um produto.");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      setError("Informe uma quantidade válida.");
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const inCart = cart.find((c) => c.productId === selectedProductId)?.quantity ?? 0;
    if (inCart + qty > product.stockQuantity) {
      setError(
        `Estoque insuficiente. Disponível: ${product.stockQuantity} (carrinho: ${inCart}).`
      );
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.productId === selectedProductId);
      if (existing) {
        return prev.map((c) =>
          c.productId === selectedProductId
            ? { ...c, quantity: c.quantity + qty }
            : c
        );
      }
      return [...prev, { productId: selectedProductId, quantity: qty }];
    });

    setQuantity("1");
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  }

  function getCartTotal() {
    return cart.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  }

  // --- Confirma venda via POST /api/sales e atualiza estoque ---
  async function handleRegisterSale() {
    if (cart.length === 0) {
      setError("Adicione produtos à venda.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erro ao registrar venda.");
      setSaving(false);
      return;
    }

    setCart([]);
    setSelectedProductId("");
    setSuccess(`Venda registrada! Total: ${formatPrice(data.total)}. Estoque atualizado.`);
    await loadData();
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Registrar Venda
        </h1>
        <p className="text-muted">
          Ao confirmar a venda, o estoque é baixado automaticamente no banco de dados.
        </p>
      </div>

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* --- Formulário de nova venda e carrinho --- */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-display text-lg font-semibold">Nova venda</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Produto</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">Selecione...</option>
                {products
                  .filter((p) => p.active && p.stockQuantity > 0)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name} (estoque: {p.stockQuantity})
                    </option>
                  ))}
              </select>
            </div>

            {selectedProduct && (
              <p className="text-sm text-muted">
                Preço unitário:{" "}
                <span className="font-medium text-primary">
                  {formatPrice(selectedProduct.price)}
                </span>
              </p>
            )}

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <button
                type="button"
                onClick={addToCart}
                className="mt-auto inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </button>
            </div>
          </div>

          {cart.length > 0 && (
            <div className="mt-6 border-t border-border pt-6">
              <h3 className="mb-3 text-sm font-medium text-muted">Itens da venda</h3>
              <div className="space-y-2">
                {cart.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted">
                          {item.quantity}x {formatPrice(product.price)} ={" "}
                          {formatPrice(item.quantity * product.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="rounded p-1 text-muted hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="font-semibold">Total</span>
                <span className="font-display text-xl font-bold text-primary">
                  {formatPrice(getCartTotal())}
                </span>
              </div>

              <button
                type="button"
                onClick={handleRegisterSale}
                disabled={saving}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-white hover:bg-primary-dark disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4" />
                {saving ? "Registrando..." : "Confirmar venda e baixar estoque"}
              </button>
            </div>
          )}
        </div>

        {/* --- Histórico de vendas recentes --- */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-display text-lg font-semibold">Vendas recentes</h2>
          {recentSales.length > 0 ? (
            <div className="divide-y divide-border">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{sale.product.name}</p>
                    <p className="text-xs text-muted">
                      {sale.product.code} · {sale.quantity} un. ·{" "}
                      {new Date(sale.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {formatPrice(sale.total)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted">Nenhuma venda registrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}
