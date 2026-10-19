
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  LoaderCircle,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

import { useToast } from "@/src/components/providers/ToastProvider";
import {
  confirmDelete,
} from "@/src/lib/notifications";

import type {
  Order,
  OrderItem,
  OrdersMode,
} from "../types/order";

import {
  API_BASE_URL,
  formatOrderDate,
  formatPrice,
  getCustomerAddress,
  getCustomerName,
  getCustomerPhone,
  getConfirmedOrders,
  getItemSubtotal,
  getOrderStatus,
  getPendingOrders,
  resolveImagePath,
} from "../utils/orderHelpers";

type Props = {
  mode: OrdersMode;
};

const pageInfo: Record<
  OrdersMode,
  { title: string; description: string }
> = {
  all: {
    title: "All Orders",
    description: "Review and manage customer orders.",
  },
  pending: {
    title: "Pending Orders",
    description: "Orders waiting for confirmation.",
  },
  confirmed: {
    title: "Confirmed Orders",
    description: "Orders successfully confirmed.",
  },
};

export default function OrdersPage({ mode }: Props) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Unable to load orders (${response.status}).`
        );
      }

      const data: unknown = await response.json();

      const fetchedOrders: Order[] = Array.isArray(data)
        ? data
        : data &&
            typeof data === "object" &&
            "orders" in data &&
            Array.isArray(data.orders)
          ? data.orders
          : [];

      fetchedOrders.sort((a, b) => {
        const first = new Date(a.createdAt || 0).getTime();
        const second = new Date(b.createdAt || 0).getTime();
        return second - first;
      });

      setOrders(fetchedOrders);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("adminLoginTime")) {
      router.replace("/admin");
      return;
    }

    void loadOrders();
  }, [loadOrders, router]);

  const visibleOrders = useMemo(() => {
    let result: Order[];

    if (mode === "confirmed") {
      result = getConfirmedOrders(orders);
    } else {
      // Existing behavior: All Orders displays unconfirmed orders.
      result = getPendingOrders(orders);
    }

    const query = search.trim().toLowerCase();

    if (!query) return result;

    return result.filter((order) => {
      const searchableText = [
        order._id,
        getCustomerName(order),
        getCustomerPhone(order),
        getCustomerAddress(order),
        getOrderStatus(order),
        ...(order.items || []).map((item) => item.name || ""),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [orders, mode, search]);

  const openOrderDetails = async (orderId: string) => {
    setDetailsLoading(true);
    setSelectedOrder(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${encodeURIComponent(orderId)}`,
        {
          headers: { Accept: "application/json" },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Could not load order details.");
      }

      const order: Order = await response.json();
      setSelectedOrder(order);
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Failed to load order details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const confirmOrder = async (orderId: string) => {
    setActionId(orderId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/confirm/${encodeURIComponent(orderId)}`,
        {
          method: "PUT",
          headers: { Accept: "application/json" },
        }
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(
          result?.message || "Failed to confirm order."
        );
      }

      showSuccess("Order confirmed successfully.");
      await loadOrders();
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Error confirming order."
      );
    } finally {
      setActionId(null);
    }
  };

  const deleteOrder = async (orderId: string) => {
    setActionId(orderId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${encodeURIComponent(orderId)}`,
        {
          method: "DELETE",
          headers: { Accept: "application/json" },
        }
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(
          result?.message || "Failed to delete order."
        );
      }

      setSelectedOrder((current) =>
        current?._id === orderId ? null : current
      );

      showSuccess("Order deleted successfully.");
      await loadOrders();
    } catch (err) {
      showError(
        err instanceof Error
          ? err.message
          : "Error deleting order."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (order: Order) => {
    if (actionId) return;

    const confirmed = await confirmDelete("this order");

    if (confirmed) {
      await deleteOrder(order._id);
    }
  };

  const confirmedCount = getConfirmedOrders(orders).length;
  const pendingCount = getPendingOrders(orders).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 pt-[120px] pb-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
            <ShoppingBag size={17} />
            MyShop Admin
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {pageInfo[mode].title}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {pageInfo[mode].description}
          </p>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2">
          <StatCard
            title="Pending Orders"
            value={pendingCount}
            icon={<Package size={21} />}
          />
          <StatCard
            title="Confirmed Orders"
            value={confirmedCount}
            icon={<CheckCircle2 size={21} />}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">
                {pageInfo[mode].title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {visibleOrders.length} order
                {visibleOrders.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search orders..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
                />
              </label>

              <button
                type="button"
                onClick={() => void loadOrders()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
              <LoaderCircle className="animate-spin" size={32} />
              <p className="text-sm">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <AlertCircle
                size={34}
                className="mb-3 text-red-500"
              />
              <p className="font-semibold text-slate-800">
                Unable to load orders
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {error}
              </p>
              <button
                type="button"
                onClick={() => void loadOrders()}
                className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Try again
              </button>
            </div>
          ) : visibleOrders.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <Package
                size={38}
                className="mb-3 text-slate-300"
              />
              <p className="font-semibold text-slate-800">
                No orders found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try another search or refresh the list.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      Product
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      Customer
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      Date
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      Items
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      Total
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      Status
                    </th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {visibleOrders.map((order) => {
                    const confirmed =
                      order.status?.toLowerCase() === "confirmed";

                    return (
                      <tr
                        key={order._id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {order.items?.[0]?.image ? (
                              <img
                                src={resolveImagePath(
                                  order.items[0].image
                                )}
                                alt={
                                  order.items[0].name ||
                                  "Ordered product"
                                }
                                className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                <Package size={24} />
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="max-w-40 truncate font-semibold text-slate-800">
                                {order.items?.[0]?.name || "Product"}
                              </p>

                              {order.items &&
                                order.items.length > 1 && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    +{order.items.length - 1} more
                                    product(s)
                                  </p>
                                )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {getCustomerName(order)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {getCustomerPhone(order)}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {formatOrderDate(order.createdAt)}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {order.items?.reduce(
                            (sum, item) =>
                              sum + Number(item.quantity || 0),
                            0
                          ) || 0}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                          {formatPrice(order.totalAmount)}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge confirmed={confirmed}>
                            {getOrderStatus(order)}
                          </StatusBadge>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <IconButton
                              label="View order details"
                              onClick={() =>
                                void openOrderDetails(order._id)
                              }
                            >
                              <Eye size={17} />
                            </IconButton>

                            {!confirmed && (
                              <IconButton
                                label="Confirm order"
                                variant="success"
                                disabled={actionId === order._id}
                                onClick={() =>
                                  void confirmOrder(order._id)
                                }
                              >
                                {actionId === order._id ? (
                                  <LoaderCircle
                                    size={17}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <CheckCircle2 size={17} />
                                )}
                              </IconButton>
                            )}

                            <IconButton
                              label="Delete order"
                              variant="danger"
                              disabled={actionId === order._id}
                              onClick={() => void handleDelete(order)}
                            >
                              <Trash2 size={17} />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {(selectedOrder || detailsLoading) && (
        <OrderDetailsModal
          order={selectedOrder}
          loading={detailsLoading}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>
        <p className="mt-2 text-3xl font-bold tracking-tight">
          {value}
        </p>
      </div>
      <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
        {icon}
      </div>
    </div>
  );
}

function StatusBadge({
  confirmed,
  children,
}: {
  confirmed: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
        confirmed
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
      }`}
    >
      {children}
    </span>
  );
}

function IconButton({
  children,
  label,
  onClick,
  variant = "default",
  disabled = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "success" | "danger";
  disabled?: boolean;
}) {
  const styles = {
    default:
      "border-slate-200 text-slate-600 hover:bg-slate-100",
    success:
      "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
    danger:
      "border-red-200 text-red-600 hover:bg-red-50",
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

function OrderDetailsModal({
  order,
  loading,
  onClose,
}: {
  order: Order | null;
  loading: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!order && !loading) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [order, loading, onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-details-title"
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-7">
          <div>
            <h2
              id="order-details-title"
              className="text-xl font-bold text-slate-900"
            >
              Order Details
            </h2>
            {order && (
              <p className="mt-1 text-xs text-slate-500">
                Order ID: {order._id}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={21} />
          </button>
        </header>

        {loading || !order ? (
          <div className="flex min-h-56 items-center justify-center">
            <LoaderCircle
              size={32}
              className="animate-spin text-blue-700"
            />
          </div>
        ) : (
          <div className="space-y-6 p-5 sm:p-7">
            <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
              <Info
                label="Customer"
                value={getCustomerName(order)}
              />
              <Info
                label="Phone"
                value={getCustomerPhone(order)}
              />
              <Info
                label="Shipping address"
                value={getCustomerAddress(order)}
              />
              <Info
                label="Order date"
                value={formatOrderDate(order.createdAt)}
              />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <div className="mt-2">
                  <StatusBadge
                    confirmed={
                      order.status?.toLowerCase() === "confirmed"
                    }
                  >
                    {getOrderStatus(order)}
                  </StatusBadge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-base font-bold">
                Ordered products
              </h3>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Qty</th>
                      <th className="px-4 py-3">Subtotal</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {(order.items || []).map(
                      (item: OrderItem, index: number) => (
                        <tr
                          key={
                            item._id ||
                            item.productId ||
                            `${item.name}-${index}`
                          }
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <img
                                  src={resolveImagePath(item.image)}
                                  alt={item.name || "Product"}
                                  className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-cover"
                                />
                              ) : (
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                                  <Package size={20} />
                                </div>
                              )}

                              <div>
                                <p className="font-semibold text-slate-800">
                                  {item.name}
                                </p>
                                {item.status && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    {item.status}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            {formatPrice(item.price)}
                          </td>
                          <td className="px-4 py-3">
                            {item.quantity}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-semibold">
                            {formatPrice(getItemSubtotal(item))}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-full max-w-xs rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-500">
                    Order total
                  </span>
                  <span className="text-xl font-bold text-slate-900">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}
