
export interface OrderItem {
  _id?: string;
  productId?: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  status?: string;
}

export interface ShippingAddress {
  name?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  country?: string;
}

export interface OrderUser {
  _id?: string;
  name?: string;
  phone?: string;
  email?: string;
}

export interface Order {
  _id: string;
  userId?: OrderUser | string | null;
  shippingAddress?: ShippingAddress;
  items: OrderItem[];
  status?: string;
  totalAmount: number;
  createdAt?: string;
}

export type OrdersMode = "all" | "pending" | "confirmed";
