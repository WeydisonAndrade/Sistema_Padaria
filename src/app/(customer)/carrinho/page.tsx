/**
 * Página do carrinho de compras do cliente.
 * Permite revisar itens, alterar quantidades e seguir para o checkout.
 */

"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import CartLoading from "@/components/CartLoading";
import PageHero from "@/components/PageHero";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, itemCount, updateQuantity, removeItem, isReady } = useCart();

  // --- Aguarda hidratação do carrinho (localStorage) ---
  if (!isReady) {
    return <CartLoading />;
  }

  // --- Estado vazio: incentiva o cliente a ver o cardápio ---
  if (items.length === 0) {
    return (
      <>
        <PageHero title="Carrinho" />
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted" />
          <p className="font-display text-xl text-muted">Seu carrinho está vazio.</p>
          <Link
            href="/produtos"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Ver produtos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHero
        title="Carrinho"
        subtitle={`${itemCount} item(ns) selecionado(s)`}
      />

      <div className="mx-auto max-w-3xl px-4 py-12 pb-32 md:pb-12">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-mono text-xs text-primary">{item.code}</p>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  {item.name}
                </h2>
                <p className="text-sm text-muted">
                  {formatPrice(item.price)} cada
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-secondary hover:text-primary active:bg-secondary/80"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="min-w-10 text-center text-base font-semibold tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.stockQuantity}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-secondary hover:text-primary active:bg-secondary/80 disabled:opacity-40"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-display text-lg font-bold text-primary">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="mt-1 inline-flex min-h-11 items-center gap-1.5 px-2 text-sm text-red-600 hover:underline"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 hidden rounded-2xl border border-border bg-card p-6 shadow-sm md:block">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="font-display text-2xl font-bold text-primary">
              {formatPrice(subtotal)}
            </span>
          </div>
          <Link
            href="/checkout"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-medium text-white transition-colors hover:bg-primary-dark"
          >
            Finalizar pedido
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* --- Barra fixa de subtotal e checkout (mobile) --- */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-4 shadow-[0_-8px_30px_rgba(44,24,16,0.12)] backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">Subtotal</p>
            <p className="font-display text-xl font-bold text-primary">
              {formatPrice(subtotal)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-white shadow-md shadow-primary/20 transition-colors hover:bg-primary-dark active:scale-[0.98]"
          >
            Finalizar pedido
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
