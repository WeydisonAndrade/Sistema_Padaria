"use client";

/**
 * Agrupa os providers de contexto necessários para a área do cliente,
 * envolvendo as páginas públicas com o estado global do carrinho.
 */

import { CartProvider } from "@/contexts/CartContext";

export default function CustomerProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
