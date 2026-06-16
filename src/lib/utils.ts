/**
 * Utilitários compartilhados: formatação, links WhatsApp,
 * categorias de produto, rótulos de status e serialização para API.
 */

// --- Formatação de valores ---
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// --- WhatsApp: número, link e mensagens pré-formatadas ---
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

// --- Categorias fixas de produto ---
export const PRODUCT_CATEGORIES = [
  "Pães",
  "Bolos",
  "Doces",
  "Salgados",
  "Bebidas",
  "Outros",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

// --- Formatação de datas ---
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

// --- Rótulos e cores de status (produto e pedido) ---
export function getProductStatusLabel(active: boolean): string {
  return active ? "Ativo" : "Inativo";
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    CONFIRMED: "Confirmado",
    CANCELLED: "Cancelado",
  };
  return labels[status] ?? status;
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    CONFIRMED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return colors[status] ?? "bg-secondary text-foreground";
}

export function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Aguardando Pix",
    PAID: "Pago",
    EXPIRED: "Expirado",
    CANCELLED: "Cancelado",
  };
  return labels[status] ?? status;
}

export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    PAID: "bg-green-100 text-green-700",
    EXPIRED: "bg-red-100 text-red-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return colors[status] ?? "bg-secondary text-foreground";
}

export function buildOrderWhatsAppMessage(
  bakeryName: string,
  orderNumber: string,
  total: number,
  customerName: string,
  paid = false
): string {
  if (paid) {
    return `Olá! Sou ${customerName}. Paguei via Pix o pedido ${orderNumber} no site da ${bakeryName} (${formatPrice(total)}). Gostaria de combinar a entrega/retirada.`;
  }
  return `Olá! Sou ${customerName}. Acabei de fazer o pedido ${orderNumber} no site da ${bakeryName} no valor de ${formatPrice(total)}. Gostaria de combinar a forma de pagamento e entrega.`;
}

// --- Serialização de datas do produto para resposta JSON ---
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
