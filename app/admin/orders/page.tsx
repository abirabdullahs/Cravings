"use client";

import { useEffect, useState } from "react";
import type { AdminOrder } from "@/components/admin/admin-types";

const money = (value: string | number) =>
  `৳${Number(value || 0).toLocaleString()}`;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const query = new URLSearchParams({
        orderStatus,
        paymentStatus,
        deliveryStatus,
      });
      const response = await fetch(`/api/admin/orders?${query}`);
      if (response.ok) setOrders((await response.json()).orders ?? []);
      setLoading(false);
    }
    void load();
  }, [orderStatus, paymentStatus, deliveryStatus]);

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
              </tr>
            ))}
            {!loading && !orders.length && (
              <tr>
                <td
                  colSpan={7}
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
    </div>
  );
}
