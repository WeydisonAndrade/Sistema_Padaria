/**
 * @layer components
 * @module ProductCard
 * Testes do card de produto: renderização, carrinho e estoque.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProductCard from "@/components/ProductCard";
import { CartProvider } from "@/contexts/CartContext";
import type { Product } from "@/types";

const baseProduct: Product = {
  id: "prod-card-1",
  code: "PAO001",
  name: "Pão Francês",
  category: "Pães",
  price: 5.5,
  stockQuantity: 10,
  expirationDate: null,
  imageUrl: null,
  active: true,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

function renderCard(product: Product = baseProduct) {
  return render(
    <CartProvider>
      <ProductCard product={product} whatsapp="5511999999999" />
    </CartProvider>
  );
}

describe("ProductCard", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("exibe nome, código, categoria, preço e estoque", () => {
    renderCard();

    expect(screen.getByRole("heading", { name: "Pão Francês" })).toBeInTheDocument();
    expect(screen.getByText("PAO001")).toBeInTheDocument();
    expect(screen.getAllByText("Pães").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/R\$\s*5,50/)).toBeInTheDocument();
    expect(screen.getByText(/10 unidade\(s\) em estoque/)).toBeInTheDocument();
  });

  it("adiciona produto ao carrinho ao clicar no botão", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: /adicionar ao carrinho/i }));

    const stored = JSON.parse(localStorage.getItem("tutti-pane-cart") ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      productId: "prod-card-1",
      code: "PAO001",
      quantity: 1,
    });
  });

  it("mostra feedback visual após adicionar ao carrinho", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: /adicionar ao carrinho/i }));

    expect(screen.getByText("Adicionado!")).toBeInTheDocument();

    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /adicionar ao carrinho/i })).toBeInTheDocument();
    });
  });

  it("exibe estado indisponível sem estoque", () => {
    renderCard({ ...baseProduct, stockQuantity: 0 });

    expect(screen.getByRole("button", { name: /indisponível/i })).toBeDisabled();
    expect(screen.getByText("Sem estoque no momento")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /adicionar ao carrinho/i })).not.toBeInTheDocument();
  });

  it("renderiza link do WhatsApp com mensagem do produto", () => {
    renderCard();

    const link = screen.getByRole("link", { name: /pedir pelo whatsapp/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("wa.me/5511999999999"));
    expect(link.getAttribute("href")).toContain(encodeURIComponent("Pão Francês"));
  });
});
