/**
 * Tipos compartilhados entre frontend e API: entidades de domínio
 * e estruturas usadas no carrinho e na área do cliente.
 */

// --- Produto ---
export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  expirationDate: string | Date | null;
  imageUrl: string | null;
  active: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// --- Configurações da padaria ---
export interface BakerySettings {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  whatsapp: string;
  latitude: number;
  longitude: number;
  openingHours: string;
}

// --- Sessão do administrador ---
export interface AdminInfo {
  adminId: string;
  email: string;
  name: string;
}

// --- Carrinho do cliente ---
export interface CartLine {
  productId: string;
  code: string;
  name: string;
  price: number;
  imageUrl: string | null;
  stockQuantity: number;
  quantity: number;
}

// --- Pedido e itens ---
export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product?: {
    code: string;
    name: string;
    category: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  notes: string | null;
  status: string;
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}
