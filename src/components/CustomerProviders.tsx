"use client";

import { CartProvider } from "@/contexts/CartContext";

export default function CustomerProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
}
