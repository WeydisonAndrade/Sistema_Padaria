"use client";

/**
 * Botão de acesso ao carrinho exibido no cabeçalho,
 * com badge indicando a quantidade de itens adicionados.
 */

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function CartButton() {
  const { itemCount, isReady } = useCart();

  return (
    <Link
      href="/carrinho"
      className="relative rounded-lg p-2 text-muted transition-colors hover:bg-butter/30 hover:text-coffee"
      aria-label={
        isReady
          ? `Carrinho com ${itemCount} item(ns)`
          : "Carrinho"
      }
    >
      <ShoppingCart className="h-5 w-5" />
      {/* --- Badge com contagem de itens --- */}
      {isReady && itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
