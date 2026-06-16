/**
 * Página de checkout do cliente.
 * Coleta dados do comprador, envia pedido à API e redireciona para confirmação.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import CartLoading from "@/components/CartLoading";
import { formatPrice } from "@/lib/utils";
import { BAKERY_TAGLINE } from "@/lib/constants";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, isReady } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Aguarda hidratação do carrinho antes de renderizar ---
  if (!isReady) {
    return <CartLoading />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="font-display text-xl text-muted">Seu carrinho está vazio.</p>
        <Link
          href="/produtos"
          className="mt-6 inline-block text-primary hover:underline"
        >
          Voltar aos produtos
        </Link>
      </div>
    );
  }

  // --- Submissão: cria pedido via POST /api/orders e limpa o carrinho ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          notes,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao finalizar pedido.");
        setLoading(false);
        return;
      }

      const phone = customerPhone.replace(/\D/g, "");
      clearCart();
      router.push(
        `/pedidos/confirmacao/${data.id}?phone=${encodeURIComponent(phone)}`
      );
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <>
      <div className="hero-gradient border-b border-border py-16 text-center">
        <p className="mb-2 text-xs font-medium tracking-widest text-gold uppercase">
          {BAKERY_TAGLINE}
        </p>
        <h1 className="section-title font-display text-4xl font-bold text-foreground md:text-5xl">
          Finalize seu pedido
        </h1>
        <p className="mx-auto mt-8 max-w-md text-muted">
          Preencha seus dados e pague com Pix na próxima etapa
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 lg:grid-cols-5">
        <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-3">
          <Link
            href="/carrinho"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao carrinho
          </Link>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-5 font-display text-xl font-semibold">Seus dados</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium">
                  Nome completo *
                </label>
                <input
                  id="name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-medium">
                  Telefone / WhatsApp *
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                  E-mail *
                </label>
                <input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="seu@email.com"
                />
                <p className="mt-1 text-xs text-muted">
                  Necessário para gerar o pagamento Pix no Mercado Pago.
                </p>
              </div>

              <div>
                <label htmlFor="notes" className="mb-1 block text-sm font-medium">
                  Observações (opcional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Horário preferido, endereço de entrega, etc."
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando…
              </>
            ) : (
              `Ir para pagamento Pix · ${formatPrice(subtotal)}`
            )}
          </button>

          <p className="text-center text-xs text-muted">
            Você será redirecionado para a tela com QR Code Pix (Mercado Pago). O pedido
            expira em 30 minutos se o pagamento não for confirmado.
          </p>
        </form>

        {/* --- Resumo lateral dos itens e total --- */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-display text-lg font-semibold">Resumo</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="font-semibold">Total</span>
              <span className="font-display text-xl font-bold text-primary">
                {formatPrice(subtotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
