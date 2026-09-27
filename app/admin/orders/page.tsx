"use client";

import { useEffect, useState } from "react";
import type { AdminOrder } from "@/types/admin-types";

type OrderDetails = {
  order: AdminOrder & {
    subtotal: string;
    delivery_fee: string;
    discount: string;
    delivery_instructions: string | null;
    payment_method: string | null;
    payment_amount: string | null;
    transaction_id: string | null;
    rider_name: string | null;
  };
  items: Array<{
    id: number;
    item_name: string;
    quantity: number;
    unit_price: string;
    subtotal: string;
  }>;
};

const money = (value: string | number) =>
  `৳${Number(value || 0).toLocaleString()}`;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [details, setDetails] = useState<OrderDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  async function openDetails(orderId: number) {
    setDetailsLoading(true);
    setError("");
    const response = await fetch(`/api/admin/orders/${orderId}`);
    const payload = await response.json();
    if (response.ok) setDetails(payload);
    else setError(payload.error || "Could not load order details.");
    setDetailsLoading(false);
  }

  async function updateOrder(orderId: number, payload: Record<string, string>) {
    setSaving(true);
    setError("");
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Could not update order.");
      setSaving(false);
      return;
    }
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              ...(result.order ?? {}),
              ...(result.payment
                ? { payment_status: result.payment.status }
                : {}),
            }
          : order,
      ),
    );
    if (details?.order.id === orderId) {
      setDetails((current) =>
        current
          ? {
              ...current,
              order: {
                ...current.order,
                ...(result.order ?? {}),
                ...(result.payment
                  ? { payment_status: result.payment.status }
                  : {}),
              },
            }
          : current,
      );
    }
    setSaving(false);
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      const query = new URLSearchParams({
        orderStatus,
        paymentStatus,
        deliveryStatus,
        page: String(page),
        limit: String(limit),
      });
      try {
        const response = await fetch(`/api/admin/orders?${query}`);
        const payload = await response.json();
        if (response.ok) {
          setOrders(payload.orders ?? []);
          setTotal(Number(payload.total ?? 0));
        } else setError(payload.error || "Could not load orders.");
      } catch {
        setError("Could not load orders.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [orderStatus, paymentStatus, deliveryStatus, page]);

  useEffect(() => setPage(1), [orderStatus, paymentStatus, deliveryStatus]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          Admin orders
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold">Order monitoring</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Filter order, payment, and delivery activity.
        </p>
      </header>
      {error && (
        <p className="mb-4 border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={orderStatus}
          onChange={(event) => setOrderStatus(event.target.value)}
          className="h-10 border border-border bg-card px-3 text-sm"
        >
          <option value="">All order statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="out_for_delivery">Out for delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={paymentStatus}
          onChange={(event) => setPaymentStatus(event.target.value)}
          className="h-10 border border-border bg-card px-3 text-sm"
        >
          <option value="">All payments</option>
          <option value="pending">Pending</option>
          <option value="completed">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={deliveryStatus}
          onChange={(event) => setDeliveryStatus(event.target.value)}
          className="h-10 border border-border bg-card px-3 text-sm"
        >
          <option value="">All deliveries</option>
          <option value="unassigned">Unassigned</option>
          <option value="accepted">Accepted</option>
          <option value="picked_up">Picked up</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-240 text-left text-sm">
          <thead className="border-b border-border bg-secondary/50">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Restaurant</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border">
                <td className="px-4 py-4 font-semibold">
                  #{order.id}
                  <span className="block text-xs font-normal text-muted-foreground">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {order.customer_name}
                  <span className="block text-xs text-muted-foreground">
                    {order.customer_email}
                  </span>
                </td>
                <td className="px-4 py-4">{order.restaurant_name}</td>
                <td className="px-4 py-4">{money(order.total_amount)}</td>
                <td className="px-4 py-4">{order.order_status}</td>
                <td className="px-4 py-4">
                  {order.payment_status || "Not recorded"}
                </td>
                <td className="px-4 py-4">
                  {order.delivery_status || "Not recorded"}
                </td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => void openDetails(order.id)}
                    className="font-semibold text-primary"
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
            {!loading && !orders.length && (
              <tr>
                <td
                  colSpan={8}
                  className="p-6 text-center text-sm text-muted-foreground"
                >
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && (
          <p className="p-4 text-sm text-muted-foreground">Loading orders...</p>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Page {page} of {Math.max(Math.ceil(total / limit), 1)}</span>
        <div className="flex gap-2">
          <button type="button" disabled={page === 1 || loading} onClick={() => setPage((current) => current - 1)} className="border border-border px-3 py-2 disabled:opacity-50">Previous</button>
          <button type="button" disabled={page >= Math.ceil(total / limit) || loading} onClick={() => setPage((current) => current + 1)} className="border border-border px-3 py-2 disabled:opacity-50">Next</button>
        </div>
      </div>
      {(detailsLoading || details) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-border bg-card p-6 shadow-xl">
            {detailsLoading && <p className="text-sm">Loading order details...</p>}
            {details && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Order #{details.order.id}</p>
                    <h2 className="font-serif text-2xl font-bold">{details.order.restaurant_name}</h2>
                  </div>
                  <button type="button" onClick={() => setDetails(null)} className="text-sm text-muted-foreground">
                    Close
                  </button>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">
                    Order status
                    <select
                      value={details.order.order_status}
                      disabled={saving}
                      onChange={(event) => void updateOrder(details.order.id, { orderStatus: event.target.value })}
                      className="mt-1 w-full border border-border bg-background px-3 py-2"
                    >
                      {['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm">
                    Payment status
                    <select
                      value={details.order.payment_status ?? ""}
                      disabled={saving || !details.order.payment_status}
                      onChange={(event) => void updateOrder(details.order.id, { paymentStatus: event.target.value })}
                      className="mt-1 w-full border border-border bg-background px-3 py-2"
                    >
                      {['pending', 'completed', 'failed', 'refunded'].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="mt-5 border-t border-border pt-4">
                  {details.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-4 py-2 text-sm">
                      <span>{item.quantity} × {item.item_name}</span>
                      <span>{money(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Customer: {details.order.customer_name} · {details.order.customer_email}
                </p>
                {details.order.delivery_instructions && (
                  <p className="mt-2 text-sm">Instructions: {details.order.delivery_instructions}</p>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
