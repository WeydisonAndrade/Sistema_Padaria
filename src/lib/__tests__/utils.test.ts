/**
 * @layer unit
 * @module utils
 * Testes unitários das funções puras de formatação, WhatsApp e status.
 */
import { describe, expect, it } from "vitest";
import {
  buildGeneralWhatsAppMessage,
  buildOrderWhatsAppMessage,
  buildProductWhatsAppMessage,
  buildWhatsAppLink,
  formatDate,
  formatDateInput,
  formatPrice,
  formatWhatsAppNumber,
  getOrderStatusColor,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  getProductStatusLabel,
  PRODUCT_CATEGORIES,
  serializeProduct,
} from "@/lib/utils";

describe("formatPrice", () => {
  it("formata valor em Real brasileiro", () => {
    expect(formatPrice(12.5)).toContain("12,50");
    expect(formatPrice(12.5)).toContain("R$");
  });
});

describe("formatWhatsAppNumber", () => {
  it("remove caracteres não numéricos", () => {
    expect(formatWhatsAppNumber("(11) 99999-9999")).toBe("11999999999");
  });
});

describe("buildWhatsAppLink", () => {
  it("monta URL wa.me com mensagem codificada", () => {
    const link = buildWhatsAppLink("11999999999", "Olá mundo");
    expect(link).toBe("https://wa.me/11999999999?text=Ol%C3%A1%20mundo");
  });
});

describe("mensagens WhatsApp", () => {
  it("monta mensagem de produto com preço formatado", () => {
    const msg = buildProductWhatsAppMessage("Pão Francês", 4.5);
    expect(msg).toContain("Pão Francês");
    expect(msg).toContain("R$");
  });

  it("monta mensagem geral com nome da padaria", () => {
    expect(buildGeneralWhatsAppMessage("Tutti Pane")).toContain("Tutti Pane");
  });

  it("diferencia mensagem de pedido pago e pendente", () => {
    const paid = buildOrderWhatsAppMessage("Tutti Pane", "TP001", 20, "Maria", true);
    const pending = buildOrderWhatsAppMessage("Tutti Pane", "TP001", 20, "Maria", false);
    expect(paid).toContain("Paguei via Pix");
    expect(pending).toContain("forma de pagamento");
  });
});

describe("formatDate", () => {
  it("retorna traço para valor vazio", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("formata data em pt-BR", () => {
    const formatted = formatDate(new Date(2025, 5, 13)); // 13/06/2025 local
    expect(formatted).toMatch(/13/);
    expect(formatted).toMatch(/2025/);
  });
});

describe("formatDateInput", () => {
  it("retorna string vazia para null", () => {
    expect(formatDateInput(null)).toBe("");
  });

  it("retorna yyyy-mm-dd para input HTML", () => {
    expect(formatDateInput(new Date("2025-06-13T12:00:00.000Z"))).toBe("2025-06-13");
  });
});

describe("rótulos de status", () => {
  it("traduz status de pedido conhecido", () => {
    expect(getOrderStatusLabel("PENDING")).toBe("Pendente");
    expect(getOrderStatusLabel("UNKNOWN")).toBe("UNKNOWN");
  });

  it("retorna classes Tailwind para status de pedido", () => {
    expect(getOrderStatusColor("CONFIRMED")).toContain("green");
  });

  it("traduz status de pagamento Pix", () => {
    expect(getPaymentStatusLabel("PAID")).toBe("Pago");
  });

  it("traduz status de produto ativo/inativo", () => {
    expect(getProductStatusLabel(true)).toBe("Ativo");
    expect(getProductStatusLabel(false)).toBe("Inativo");
  });
});

describe("PRODUCT_CATEGORIES", () => {
  it("contém categorias esperadas do cardápio", () => {
    expect(PRODUCT_CATEGORIES).toContain("Pães");
    expect(PRODUCT_CATEGORIES).toContain("Bebidas");
  });
});

describe("serializeProduct", () => {
  it("converte datas Date para ISO string", () => {
    const createdAt = new Date("2025-01-15T10:00:00.000Z");
    const result = serializeProduct({
      id: "1",
      code: "PAO001",
      name: "Teste",
      expirationDate: null,
      createdAt,
      updatedAt: createdAt,
    });

    expect(result.createdAt).toBe("2025-01-15T10:00:00.000Z");
    expect(result.expirationDate).toBeNull();
  });
});
