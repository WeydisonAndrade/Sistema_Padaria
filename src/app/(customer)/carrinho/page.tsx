"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import CartLoading from "@/components/CartLoading";
import { formatPrice } from "@/lib/utils";
import { BAKERY_TAGLINE } from "@/lib/constants";

export default function CartPage() {
  const { items, subtotal, itemCount, updateQuantity, removeItem, isReady } = useCart();

  if (!isReady) {
    return <CartLoading />;
  }

  if (items.length === 0) {
    return (
      <>
        <div className="hero-gradient border-b border-border py-16 text-center">
          <p className="mb-2 text-xs font-medium tracking-widest text-gold uppercase">
            {BAKERY_TAGLINE}
          </p>
          <h1 className="section-title font-display text-4xl font-bold text-foreground md:text-5xl">
            Carrinho
          </h1>
        </div>
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
      <div className="hero-gradient border-b border-border py-16 text-center">
        <p className="mb-2 text-xs font-medium tracking-widest text-gold uppercase">
          {BAKERY_TAGLINE}
        </p>
        <h1 className="section-title font-display text-4xl font-bold text-foreground md:text-5xl">
          Carrinho
        </h1>
        <p className="mx-auto mt-8 max-w-md text-muted">
          {itemCount} item(ns) selecionado(s)
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12">
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
                <div className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="rounded-full p-1.5 text-muted hover:bg-secondary hover:text-primary"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.stockQuantity}
                    className="rounded-full p-1.5 text-muted hover:bg-secondary hover:text-primary disabled:opacity-40"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-display text-lg font-bold text-primary">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="mt-1 inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
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
    </>
  );
}
