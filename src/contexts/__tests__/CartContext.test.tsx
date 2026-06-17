/**
 * @layer components
 * @module CartContext
 * Testes do carrinho: adicionar, limite de estoque e subtotal.
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { CartProvider, useCart } from "@/contexts/CartContext";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const sampleItem = {
  productId: "prod-1",
  code: "PAO001",
  name: "Pão Francês",
  price: 4.5,
  imageUrl: null,
  stockQuantity: 5,
};

describe("CartContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("inicia vazio após hidratação", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.subtotal).toBe(0);
  });

  it("adiciona item e calcula subtotal", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => expect(result.current.isReady).toBe(true));

    act(() => {
      result.current.addItem(sampleItem, 2);
    });

    expect(result.current.itemCount).toBe(2);
    expect(result.current.subtotal).toBe(9);
  });

  it("não ultrapassa estoque disponível", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => expect(result.current.isReady).toBe(true));

    act(() => {
      result.current.addItem(sampleItem, 5);
      result.current.addItem(sampleItem, 1);
    });

    expect(result.current.itemCount).toBe(5);
  });

  it("remove item do carrinho", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => expect(result.current.isReady).toBe(true));

    act(() => {
      result.current.addItem(sampleItem, 1);
      result.current.removeItem(sampleItem.productId);
    });

    expect(result.current.items).toHaveLength(0);
  });
});
