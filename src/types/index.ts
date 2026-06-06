export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  expirationDate: string | Date | null;
  active: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

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

export interface AdminInfo {
  adminId: string;
  email: string;
  name: string;
}
