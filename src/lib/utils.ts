export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatWhatsAppNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function buildWhatsAppLink(
  phone: string,
  message: string
): string {
  const number = formatWhatsAppNumber(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

export function buildProductWhatsAppMessage(
  productName: string,
  price: number
): string {
  return `Olá! Gostaria de pedir: ${productName} (${formatPrice(price)}). Podem me informar a disponibilidade?`;
}

export function buildGeneralWhatsAppMessage(bakeryName: string): string {
  return `Olá! Vim pelo site da ${bakeryName} e gostaria de fazer um pedido.`;
}

export const PRODUCT_CATEGORIES = [
  "Pães",
  "Bolos",
  "Doces",
  "Salgados",
  "Bebidas",
  "Outros",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export function formatDate(value: string | Date | null): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function formatDateInput(value: string | Date | null): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().split("T")[0];
}

export function getProductStatusLabel(active: boolean): string {
  return active ? "Ativo" : "Inativo";
}

export function serializeProduct<T extends {
  expirationDate: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}>(product: T) {
  return {
    ...product,
    expirationDate: product.expirationDate
      ? typeof product.expirationDate === "string"
        ? product.expirationDate
        : product.expirationDate.toISOString()
      : null,
    createdAt:
      typeof product.createdAt === "string"
        ? product.createdAt
        : product.createdAt.toISOString(),
    updatedAt:
      typeof product.updatedAt === "string"
        ? product.updatedAt
        : product.updatedAt.toISOString(),
  };
}
