
import type { Order, OrderItem } from "../types/order";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export function isConfirmed(order: Order): boolean {
  return order.status?.toLowerCase() === "confirmed";
}

export function getPendingOrders(orders: Order[]): Order[] {
  return orders.filter((order) => !isConfirmed(order));
}

export function getConfirmedOrders(orders: Order[]): Order[] {
  return orders.filter(isConfirmed);
}

export function getCustomerName(order: Order): string {
  const user =
    typeof order.userId === "object" && order.userId
      ? order.userId
      : undefined;

  return user?.name || order.shippingAddress?.name || "Guest";
}

export function getCustomerPhone(order: Order): string {
  const user =
    typeof order.userId === "object" && order.userId
      ? order.userId
      : undefined;

  return user?.phone || order.shippingAddress?.phone || "N/A";
}

export function getCustomerAddress(order: Order): string {
  const address = order.shippingAddress;

  if (!address) return "N/A";

  return [
    address.addressLine1,
    address.city,
    address.country,
  ]
    .filter(Boolean)
    .join(", ") || "N/A";
}

export function getOrderStatus(order: Order): string {
  return order.status || "Pending";
}

export function getItemSubtotal(item: OrderItem): number {
  return Number(item.price || 0) * Number(item.quantity || 0);
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(Number(amount)) ? Number(amount) : 0);
}

export function formatOrderDate(date?: string): string {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

export function resolveImagePath(image?: string): string {
  if (!image) {
    return "https://dummyimage.com/100x100/e5e7eb/6b7280&text=No+Image";
  }

  if (
    image.startsWith("data:image") ||
    image.startsWith("https://") ||
    image.startsWith("http://")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return image.startsWith("/uploads/") || image.startsWith("/upload/")
      ? `${API_BASE_URL}${image}`
      : image;
  }

  if (image.startsWith("uploads/") || image.startsWith("upload/")) {
    return `${API_BASE_URL}/${image}`;
  }

  if (image.startsWith("images/") || image.startsWith("img/")) {
    return `/${image}`;
  }

  return `${API_BASE_URL}/upload/${image}`;
}
