"use client";

import { useEffect, useState } from "react";

type Restaurant = { id: number; name: string; address: string; owner_name: string; owner_phone: string | null; active_status: boolean; product_count: string; order_count: string };
type Rider = { id: number; name: string; phone: string | null; vehicle_type: string; vehicle_number: string; status: "offline" | "idle" | "busy" };
type Profit = { totals: { product_sales: string; platform_profit: string }; restaurants: { id: number; name: string; order_count: string; total_sales: string; admin_profit: string }[] };
type Report = { products: { id: number; name: string; total_sold: string; total_revenue: string }[]; reviews: { id: number; customer_name: string; rating: number; comment: string | null }[] };
type ReviewRequest = { id: number; user_id: number; source_role: string; requested_role: string; status: string; details: string | null; verification_data?: Record<string, unknown>; created_at: string; reviewed_at?: string | null; review_note?: string | null; rejection_reason?: string | null; requester_name?: string; requester_email?: string; requester_phone?: string | null };
type Coupon = { id: number; code: string; discount_type: string; discount_value: string; minimum_order: string; expiry_date: string | null; assigned_count: number };
type Customer = { id: number; name: string; email: string };
type AdminUser = { id: number; name: string; email: string; phone: string | null; role: string; created_at: string; order_count: number; coupon_count: number; role_request_count: number };
type AdminOrder = { id: number; total_amount: string; delivery_fee: string; discount: string; order_status: string; created_at: string; customer_name: string; customer_email: string; restaurant_name: string; payment_status: string | null; payment_method: string | null; delivery_status: string | null; rider_name: string | null };
type AdminOrderDetail = AdminOrder & { customer_phone: string | null; restaurant_address: string; transaction_id: string | null; rider_phone: string | null };
type AdminOrderItem = { id: number; item_name: string; quantity: number; unit_price: string; subtotal: string };
type AdminReview = { id: number; rating: number; comment: string | null; created_at: string; customer_name: string; customer_email: string; restaurant_name: string; order_id: number };

const money = (value: string | number) => `৳${Number(value || 0).toLocaleString()}`;

export default function AdminDashboard() {
  const [range, setRange] = useState("weekly");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [profit, setProfit] = useState<Profit | null>(null);
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [couponForm, setCouponForm] = useState({ code: "", discountType: "percentage", discountValue: "", minimumOrder: "0", expiryDate: "", assignMode: "all", userIds: [] as number[] });
  const [couponSaving, setCouponSaving] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userRole, setUserRole] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userLoading, setUserLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState<AdminOrderItem[]>([]);
  const [notificationForm, setNotificationForm] = useState({ title: "", message: "", audience: "all", userIds: [] as number[] });
  const [notificationSaving, setNotificationSaving] = useState(false);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [reviewRating, setReviewRating] = useState("0");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const responses = await Promise.all([
          fetch("/api/admin/restaurants"),
          fetch("/api/admin/riders"),
          fetch(`/api/admin/profit?range=${range}`),
          fetch("/api/admin/requests"),
          fetch("/api/admin/coupons"),
        ]);
        if (!responses.every((response) => response.ok)) throw new Error("Could not load admin data");
        setRestaurants((await responses[0].json()).restaurants);
        setRiders((await responses[1].json()).riders);
        setProfit(await responses[2].json());
        const requestPayload = await responses[3].json();
        setRequests(requestPayload.requests ?? []);
        const couponPayload = await responses[4].json();
        setCoupons(couponPayload.coupons ?? []);
        setCustomers(couponPayload.users ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load admin data");
      }
    }
    void load();
  }, [range]);

  useEffect(() => {
    async function loadUsers() {
      setUserLoading(true);
      try {
        const query = new URLSearchParams({ role: userRole, search: userSearch });
        const response = await fetch(`/api/admin/users?${query}`);
        if (!response.ok) throw new Error("Could not load users");
        setUsers((await response.json()).users ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load users");
      } finally {
        setUserLoading(false);
      }
    }
    const timer = window.setTimeout(() => void loadUsers(), 250);
    return () => window.clearTimeout(timer);
  }, [userRole, userSearch]);

  useEffect(() => {
    async function loadOrders() {
      setOrderLoading(true);
      try {
        const query = new URLSearchParams({ orderStatus, paymentStatus, deliveryStatus });
        const response = await fetch(`/api/admin/orders?${query}`);
        if (!response.ok) throw new Error("Could not load orders");
        setOrders((await response.json()).orders ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load orders");
      } finally {
        setOrderLoading(false);
      }
    }
    void loadOrders();
  }, [orderStatus, paymentStatus, deliveryStatus]);

  useEffect(() => {
    async function loadReviews() {
      try {
        const response = await fetch(`/api/admin/reviews?rating=${reviewRating}`);
        if (!response.ok) throw new Error("Could not load reviews");
        setReviews((await response.json()).reviews ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load reviews");
      }
    }
    void loadReviews();
  }, [reviewRating]);

  async function openOrder(orderId: number) {
    const response = await fetch(`/api/admin/orders/${orderId}`);
    if (!response.ok) {
      setError("Could not load order details");
      return;
    }
    const payload = await response.json();
    setSelectedOrder(payload.order);
    setSelectedOrderItems(payload.items ?? []);
  }

  async function sendNotification(event: React.FormEvent) {
    event.preventDefault();
    setNotificationSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(notificationForm) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not send notification");
      setNotificationForm({ title: "", message: "", audience: "all", userIds: [] });
      setError(`Notification sent to ${payload.sentCount} customer${payload.sentCount === 1 ? "" : "s"}.`);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Could not send notification");
    } finally {
      setNotificationSaving(false);
    }
  }

  async function openRestaurant(restaurant: Restaurant) {
    setSelectedRestaurant(restaurant);
    const response = await fetch(`/api/admin/restaurants/${restaurant.id}?range=${range}`);
    if (response.ok) setReport(await response.json());
  }

  async function toggleRestaurant(restaurant: Restaurant) {
    try {
      const response = await fetch("/api/admin/restaurants", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restaurantId: restaurant.id, activeStatus: !restaurant.active_status }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not update restaurant status");
      setRestaurants((current) => current.map((item) => item.id === restaurant.id ? { ...item, active_status: payload.restaurant.active_status } : item));
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Could not update restaurant status");
    }
  }

  async function updateRiderStatus(riderId: number, status: Rider["status"]) {
    try {
      const response = await fetch("/api/admin/riders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ riderId, status }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not update rider status");
      setRiders((current) => current.map((rider) => rider.id === riderId ? { ...rider, status: payload.rider.status } : rider));
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Could not update rider status");
    }
  }

  async function createCoupon(event: React.FormEvent) {
    event.preventDefault();
    setCouponSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(couponForm) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not create coupon");
      setCoupons((current) => [{ ...payload.coupon, assigned_count: couponForm.assignMode === "all" ? customers.length : couponForm.userIds.length }, ...current]);
      setCouponForm({ code: "", discountType: "percentage", discountValue: "", minimumOrder: "0", expiryDate: "", assignMode: "all", userIds: [] });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not create coupon");
    } finally {
      setCouponSaving(false);
    }
  }

  async function reviewRequest(requestId: number, status: "APPROVED" | "REJECTED") {
    try {
      const response = await fetch("/api/admin/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status, reviewNote: "Reviewed by admin", rejectionReason: status === "REJECTED" ? "Verification details did not pass review" : "" }),
      });
      if (!response.ok) throw new Error("Could not update request");
      const next = await response.json();
      setRequests((current) => current.map((request) => request.id === Number(next.request?.id) ? next.request : request));
    } catch (catchError) {
      setError(catchError instanceof Error ? catchError.message : "Could not update request");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-7 sm:flex-row sm:items-end">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Admin console</p><h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">Platform overview</h1><p className="mt-2 text-sm text-muted-foreground">Restaurants, riders, sales, and platform earnings in one place.</p></div>
        <select value={range} onChange={(event) => setRange(event.target.value)} className="h-10 border border-border bg-card px-3 text-sm"><option value="weekly">Last 7 days</option><option value="28d">Last 28 days</option></select>
      </div>
      {error && <p className="mb-6 border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Restaurants" value={restaurants.length} /><Metric label="Riders" value={riders.length} /><Metric label="Product sales" value={money(profit?.totals.product_sales ?? 0)} /><Metric label="Platform profit" value={money(profit?.totals.platform_profit ?? 0)} /></div>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px]">
        <section><div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-2xl font-bold">Restaurants</h2><span className="text-sm text-muted-foreground">{restaurants.length} listed</span></div><div className="overflow-x-auto border border-border bg-card"><table className="w-full min-w-190 text-left text-sm"><thead className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Restaurant</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Products</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{restaurants.map((restaurant) => <tr key={restaurant.id} onClick={() => void openRestaurant(restaurant)} className="cursor-pointer border-b border-border last:border-0 hover:bg-secondary/40"><td className="px-4 py-4"><strong>{restaurant.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{restaurant.address}</span></td><td className="px-4 py-4">{restaurant.owner_name}<span className="mt-1 block text-xs text-muted-foreground">{restaurant.owner_phone || "No phone"}</span></td><td className="px-4 py-4">{restaurant.product_count}</td><td className="px-4 py-4">{restaurant.order_count}</td><td className="px-4 py-4">{restaurant.active_status ? "Active" : "Inactive"}</td><td className="px-4 py-4"><button onClick={(event) => { event.stopPropagation(); void toggleRestaurant(restaurant); }} className="text-xs font-bold text-primary hover:underline">{restaurant.active_status ? "Deactivate" : "Activate"}</button></td></tr>)}</tbody></table></div></section>
        <section><h2 className="mb-4 font-serif text-2xl font-bold">Riders</h2><div className="border border-border bg-card">{riders.map((rider) => <div key={rider.id} className="border-b border-border px-4 py-4 text-sm last:border-0"><div className="flex items-center justify-between gap-3"><span className="font-semibold">{rider.name}</span><select value={rider.status} onChange={(event) => void updateRiderStatus(rider.id, event.target.value as Rider["status"])} className="border border-border bg-background px-2 py-1 text-xs uppercase"><option value="offline">Offline</option><option value="idle">Available</option><option value="busy">Busy</option></select></div><span className="mt-1 block text-xs text-muted-foreground">{rider.phone || "No phone"} · {rider.vehicle_type} · {rider.vehicle_number}</span></div>)}{!riders.length && <p className="p-4 text-sm text-muted-foreground">No riders found.</p>}</div></section>
      </div>
      {requests.length > 0 && <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold">Role requests</h2>
          <span className="text-sm text-muted-foreground">{requests.length} active</span>
        </div>
        <div className="grid gap-4">
          {requests.map((request) => (
            <article key={request.id} className="rounded border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{request.requester_name ?? "Applicant"} · {request.requested_role}</div>
                  <div className="text-xs text-muted-foreground">{request.requester_email} · {request.requester_phone || "No phone"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wide">{request.status}</span>
                  <button onClick={() => void reviewRequest(Number(request.id), "APPROVED")} className="rounded bg-emerald-600 px-3 py-1 text-xs font-bold text-white">Approve</button>
                  <button onClick={() => void reviewRequest(Number(request.id), "REJECTED")} className="rounded bg-destructive px-3 py-1 text-xs font-bold text-white">Reject</button>
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">{request.details || "No details"}</div>
              {request.verification_data && Object.keys(request.verification_data).length > 0 && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {Object.entries(request.verification_data).map(([key, value]) => (
                    <div key={key} className="rounded border border-border bg-background px-3 py-2">
                      <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{key}</span>
                      <span className="block text-sm text-foreground">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
              {request.rejection_reason && <div className="mt-3 rounded border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{request.rejection_reason}</div>}
            </article>
          ))}
        </div>
      </section>}
      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-serif text-2xl font-bold">Orders</h2><p className="mt-1 text-sm text-muted-foreground">Monitor order, payment, and delivery progress.</p></div><div className="flex flex-wrap gap-2"><select value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)} className="h-10 border border-border bg-card px-3 text-sm"><option value="">All order statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="preparing">Preparing</option><option value="ready">Ready</option><option value="out_for_delivery">Out for delivery</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select><select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)} className="h-10 border border-border bg-card px-3 text-sm"><option value="">All payments</option><option value="pending">Payment pending</option><option value="completed">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select><select value={deliveryStatus} onChange={(event) => setDeliveryStatus(event.target.value)} className="h-10 border border-border bg-card px-3 text-sm"><option value="">All deliveries</option><option value="unassigned">Unassigned</option><option value="accepted">Accepted</option><option value="picked_up">Picked up</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></div></div>
        <div className="overflow-x-auto border border-border bg-card"><table className="w-full min-w-240 text-left text-sm"><thead className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Restaurant</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Order status</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Delivery</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} onClick={() => void openOrder(order.id)} className="cursor-pointer border-b border-border last:border-0 hover:bg-secondary/40"><td className="px-4 py-4 font-semibold">#{order.id}<span className="mt-1 block text-xs font-normal text-muted-foreground">{new Date(order.created_at).toLocaleString()}</span></td><td className="px-4 py-4">{order.customer_name}<span className="mt-1 block text-xs text-muted-foreground">{order.customer_email}</span></td><td className="px-4 py-4">{order.restaurant_name}</td><td className="px-4 py-4">{money(order.total_amount)}</td><td className="px-4 py-4"><span className="rounded-full border border-border px-2 py-1 text-xs font-semibold uppercase">{order.order_status}</span></td><td className="px-4 py-4">{order.payment_status || "Not recorded"}</td><td className="px-4 py-4">{order.delivery_status || "Not recorded"}</td></tr>)}{!orderLoading && !orders.length && <tr><td colSpan={7} className="p-6 text-center text-sm text-muted-foreground">No orders found.</td></tr>}</tbody></table>{orderLoading && <p className="p-4 text-sm text-muted-foreground">Loading orders...</p>}</div>
        {selectedOrder && <div className="mt-4 border border-border bg-card p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-serif text-xl font-bold">Order #{selectedOrder.id}</h3><p className="mt-1 text-sm text-muted-foreground">{selectedOrder.customer_name} · {selectedOrder.customer_email} · {selectedOrder.restaurant_name}</p></div><button onClick={() => setSelectedOrder(null)} className="text-sm text-muted-foreground hover:text-foreground">Close</button></div><div className="mt-4 grid gap-3 sm:grid-cols-4"><Metric label="Total" value={money(selectedOrder.total_amount)} /><Metric label="Order status" value={selectedOrder.order_status} /><Metric label="Payment" value={selectedOrder.payment_status || "Unknown"} /><Metric label="Delivery" value={selectedOrder.delivery_status || "Unknown"} /></div><div className="mt-5 grid gap-6 lg:grid-cols-2"><div><h4 className="mb-2 font-semibold">Items</h4>{selectedOrderItems.map((item) => <div key={item.id} className="flex justify-between border-b border-border py-2 text-sm"><span>{item.item_name} × {item.quantity}</span><span>{money(item.subtotal)}</span></div>)}</div><div className="text-sm"><h4 className="mb-2 font-semibold">Payment and delivery</h4><p>Method: {selectedOrder.payment_method || "Not recorded"}</p><p>Transaction: {selectedOrder.transaction_id || "Not recorded"}</p><p>Rider: {selectedOrder.rider_name || "Unassigned"}</p><p>Phone: {selectedOrder.rider_phone || "Not available"}</p></div></div></div>}
      </section>
      <section className="mt-10 border border-border bg-card p-6"><div className="mb-4"><h2 className="font-serif text-2xl font-bold">Send notification</h2><p className="mt-1 text-sm text-muted-foreground">Send an announcement to every customer or selected customers.</p></div><form onSubmit={sendNotification} className="grid gap-4 md:grid-cols-2"><input required placeholder="Notification title" value={notificationForm.title} onChange={(event) => setNotificationForm({ ...notificationForm, title: event.target.value })} className="border border-border bg-background px-3 py-2 text-sm" /><select value={notificationForm.audience} onChange={(event) => setNotificationForm({ ...notificationForm, audience: event.target.value, userIds: [] })} className="border border-border bg-background px-3 py-2 text-sm"><option value="all">All customers</option><option value="specific">Specific customers</option></select><textarea required placeholder="Write your message" value={notificationForm.message} onChange={(event) => setNotificationForm({ ...notificationForm, message: event.target.value })} className="min-h-24 border border-border bg-background px-3 py-2 text-sm md:col-span-2" />{notificationForm.audience === "specific" && <select required multiple value={notificationForm.userIds.map(String)} onChange={(event) => setNotificationForm({ ...notificationForm, userIds: Array.from(event.target.selectedOptions, (option) => Number(option.value)) })} className="h-28 border border-border bg-background px-3 py-2 text-sm md:col-span-2">{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.email}</option>)}</select>}<div className="md:col-span-2"><button disabled={notificationSaving} className="rounded bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">{notificationSaving ? "Sending..." : "Send notification"}</button></div></form></section>
      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-serif text-2xl font-bold">Reviews</h2><p className="mt-1 text-sm text-muted-foreground">Monitor customer feedback across the platform.</p></div><select value={reviewRating} onChange={(event) => setReviewRating(event.target.value)} className="h-10 border border-border bg-card px-3 text-sm"><option value="0">All ratings</option><option value="1">1 star</option><option value="2">2 stars</option><option value="3">3 stars</option><option value="4">4 stars</option><option value="5">5 stars</option></select></div>
        <div className="grid gap-3 md:grid-cols-2">{reviews.map((review) => <article key={review.id} className="border border-border bg-card p-4"><div className="flex items-start justify-between gap-3"><div><strong>{review.restaurant_name}</strong><p className="mt-1 text-xs text-muted-foreground">{review.customer_name} · Order #{review.order_id}</p></div><span className="font-semibold text-primary">{review.rating}/5</span></div><p className="mt-3 text-sm text-foreground">{review.comment || "No comment"}</p><p className="mt-3 text-xs text-muted-foreground">{new Date(review.created_at).toLocaleString()} · {review.customer_email}</p></article>)}{!reviews.length && <p className="border border-border bg-card p-6 text-sm text-muted-foreground">No reviews found.</p>}</div>
      </section>
      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="font-serif text-2xl font-bold">Users</h2><p className="mt-1 text-sm text-muted-foreground">Search customers, owners, riders, and admins.</p></div>
          <div className="flex gap-2"><input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search name, email, phone" className="h-10 w-64 border border-border bg-card px-3 text-sm" /><select value={userRole} onChange={(event) => setUserRole(event.target.value)} className="h-10 border border-border bg-card px-3 text-sm"><option value="">All roles</option><option value="customer">Customers</option><option value="owner">Owners</option><option value="rider">Riders</option><option value="admin">Admins</option></select></div>
        </div>
        <div className="overflow-x-auto border border-border bg-card"><table className="w-full min-w-190 text-left text-sm"><thead className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Coupons</th><th className="px-4 py-3">Joined</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} onClick={() => setSelectedUser(user)} className="cursor-pointer border-b border-border last:border-0 hover:bg-secondary/40"><td className="px-4 py-4"><strong>{user.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{user.email} · {user.phone || "No phone"}</span></td><td className="px-4 py-4"><span className="rounded-full border border-border px-2 py-1 text-xs font-semibold uppercase">{user.role}</span></td><td className="px-4 py-4">{user.order_count}</td><td className="px-4 py-4">{user.coupon_count}</td><td className="px-4 py-4">{new Date(user.created_at).toLocaleDateString()}</td></tr>)}{!userLoading && !users.length && <tr><td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">No users found.</td></tr>}</tbody></table>{userLoading && <p className="p-4 text-sm text-muted-foreground">Loading users...</p>}</div>
        {selectedUser && <div className="mt-4 border border-border bg-card p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-serif text-xl font-bold">{selectedUser.name}</h3><p className="mt-1 text-sm text-muted-foreground">{selectedUser.email} · {selectedUser.phone || "No phone"}</p></div><button onClick={() => setSelectedUser(null)} className="text-sm text-muted-foreground hover:text-foreground">Close</button></div><div className="mt-4 grid gap-3 sm:grid-cols-4"><Metric label="Role" value={selectedUser.role} /><Metric label="Orders" value={selectedUser.order_count} /><Metric label="Coupons" value={selectedUser.coupon_count} /><Metric label="Role requests" value={selectedUser.role_request_count} /></div></div>}
      </section>
      <section className="mt-10 grid gap-8 lg:grid-cols-[360px_1fr]">
        <div className="border border-border bg-card p-6"><h2 className="font-serif text-2xl font-bold">Create coupon</h2><form onSubmit={createCoupon} className="mt-5 space-y-4"><input required placeholder="Coupon code" value={couponForm.code} onChange={(event) => setCouponForm({ ...couponForm, code: event.target.value })} className="w-full border border-border bg-background px-3 py-2 text-sm uppercase" /><div className="grid grid-cols-2 gap-3"><select value={couponForm.discountType} onChange={(event) => setCouponForm({ ...couponForm, discountType: event.target.value })} className="border border-border bg-background px-3 py-2 text-sm"><option value="percentage">Percentage</option><option value="fixed_amount">Fixed amount</option></select><input required min="0.01" step="0.01" type="number" placeholder="Value" value={couponForm.discountValue} onChange={(event) => setCouponForm({ ...couponForm, discountValue: event.target.value })} className="border border-border bg-background px-3 py-2 text-sm" /></div><div className="grid grid-cols-2 gap-3"><input min="0" step="0.01" type="number" placeholder="Minimum order" value={couponForm.minimumOrder} onChange={(event) => setCouponForm({ ...couponForm, minimumOrder: event.target.value })} className="border border-border bg-background px-3 py-2 text-sm" /><input type="date" value={couponForm.expiryDate} onChange={(event) => setCouponForm({ ...couponForm, expiryDate: event.target.value })} className="border border-border bg-background px-3 py-2 text-sm" /></div><select value={couponForm.assignMode} onChange={(event) => setCouponForm({ ...couponForm, assignMode: event.target.value, userIds: [] })} className="w-full border border-border bg-background px-3 py-2 text-sm"><option value="all">Assign to all customers</option><option value="specific">Assign to specific customers</option></select>{couponForm.assignMode === "specific" && <select required multiple value={couponForm.userIds.map(String)} onChange={(event) => setCouponForm({ ...couponForm, userIds: Array.from(event.target.selectedOptions, (option) => Number(option.value)) })} className="h-28 w-full border border-border bg-background px-3 py-2 text-sm">{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.email}</option>)}</select>}<button disabled={couponSaving} className="w-full rounded bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">{couponSaving ? "Creating..." : "Create and assign coupon"}</button></form></div>
        <div><div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-2xl font-bold">Coupons</h2><span className="text-sm text-muted-foreground">{coupons.length} defined</span></div><div className="border border-border bg-card">{coupons.map((coupon) => <div key={coupon.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 last:border-0"><div><strong>{coupon.code}</strong><p className="mt-1 text-xs text-muted-foreground">{coupon.discount_type === "percentage" ? `${coupon.discount_value}% off` : `৳${coupon.discount_value} off`} · Minimum ৳{coupon.minimum_order}</p></div><div className="text-right text-xs text-muted-foreground"><div>{coupon.assigned_count} customers</div><div>{coupon.expiry_date ? `Expires ${new Date(coupon.expiry_date).toLocaleDateString()}` : "No expiry"}</div></div></div>)}{!coupons.length && <p className="p-4 text-sm text-muted-foreground">No coupons defined yet.</p>}</div></div>
      </section>
      {profit && <section className="mt-10"><h2 className="mb-4 font-serif text-2xl font-bold">Restaurant sales</h2><div className="grid gap-3 md:grid-cols-2">{profit.restaurants.map((restaurant) => <div key={restaurant.id} className="flex items-center justify-between border border-border bg-card p-4"><div><strong>{restaurant.name}</strong><p className="mt-1 text-xs text-muted-foreground">{restaurant.order_count} orders</p></div><div className="text-right"><strong>{money(restaurant.total_sales)}</strong><p className="mt-1 text-xs text-muted-foreground">{money(restaurant.admin_profit)} fee</p></div></div>)}</div></section>}
      {selectedRestaurant && report && <section className="mt-10 border-t border-border pt-8"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl font-bold">{selectedRestaurant.name} detail</h2><button onClick={() => { setSelectedRestaurant(null); setReport(null); }} className="text-sm text-muted-foreground hover:text-foreground">Close</button></div><div className="mt-4 grid gap-8 lg:grid-cols-2"><div><h3 className="mb-3 font-semibold">Product sales</h3>{report.products.map((product) => <div key={product.id} className="flex justify-between border-b border-border py-3 text-sm"><span>{product.name}<span className="ml-2 text-xs text-muted-foreground">{product.total_sold} sold</span></span><strong>{money(product.total_revenue)}</strong></div>)}</div><div><h3 className="mb-3 font-semibold">Reviews</h3>{report.reviews.map((review) => <div key={review.id} className="border-b border-border py-3 text-sm"><div className="flex justify-between"><strong>{review.customer_name}</strong><span>{review.rating}/5</span></div><p className="mt-1 text-muted-foreground">{review.comment || "No comment"}</p></div>)}</div></div></section>}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="border border-border bg-card p-5"><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>;
}