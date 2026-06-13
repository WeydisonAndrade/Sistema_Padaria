/**
 * Contexto global do carrinho de compras do cliente.
 * Persiste itens no localStorage e expõe ações de adicionar, atualizar e limpar.
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine } from "@/types";

// --- Chave de persistência no localStorage ---
const STORAGE_KEY = "tutti-pane-cart";

interface CartContextValue {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  isReady: boolean;
  addItem: (item: Omit<CartLine, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// --- Leitura segura do carrinho salvo no navegador ---
function loadStoredCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // --- Hidratação: restaura carrinho do localStorage na montagem ---
  useEffect(() => {
    setItems(loadStoredCart());
    setHydrated(true);
  }, []);

  // --- Sincronização: persiste alterações no localStorage ---
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  // --- Ações de manipulação do carrinho ---
  const addItem = useCallback(
    (item: Omit<CartLine, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((line) => line.productId === item.productId);
        const nextQty = (existing?.quantity ?? 0) + quantity;

        if (nextQty > item.stockQuantity) {
          return prev;
        }

        if (existing) {
          return prev.map((line) =>
            line.productId === item.productId
              ? { ...line, ...item, quantity: nextQty }
              : line
          );
        }

        return [...prev, { ...item, quantity }];
      });
    },
    []
  );

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((line) => line.productId !== productId);
      }

      return prev.map((line) => {
        if (line.productId !== productId) return line;
        return {
          ...line,
          quantity: Math.min(quantity, line.stockQuantity),
        };
      });
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((line) => line.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  // --- Valores derivados: quantidade total e subtotal ---
  const itemCount = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      isReady: hydrated,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, itemCount, subtotal, hydrated, addItem, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// --- Hook de consumo do contexto (exige CartProvider na árvore) ---
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }
  return context;
}
