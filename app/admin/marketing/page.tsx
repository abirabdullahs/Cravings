"use client";

import { useEffect, useState } from "react";
import type {
  AdminReview,
  Coupon,
  Customer,
} from "@/components/admin/admin-types";

export default function AdminMarketingPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [rating, setRating] = useState("0");
  const [notification, setNotification] = useState({
    title: "",
    message: "",
    audience: "all",
    userIds: [] as number[],
  });
  const [coupon, setCoupon] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minimumOrder: "0",
    expiryDate: "",
    assignMode: "all",
    userIds: [] as number[],
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/admin/coupons");
      if (response.ok) {
        const payload = await response.json();
        setCoupons(payload.coupons ?? []);
        setCustomers(payload.users ?? []);
      }
    }
    void load();
  }, []);
  useEffect(() => {
    async function load() {
      const response = await fetch(`/api/admin/reviews?rating=${rating}`);
      if (response.ok) setReviews((await response.json()).reviews ?? []);
    }
    void load();
  }, [rating]);

  async function sendNotification(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notification),
    });
    const payload = await response.json();
    setMessage(
      response.ok
        ? `Notification sent to ${payload.sentCount} customers.`
        : payload.error || "Could not send notification",
    );
    if (response.ok)
      setNotification({ title: "", message: "", audience: "all", userIds: [] });
  }
  async function createCoupon(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coupon),
    });
    const payload = await response.json();
    setMessage(
      response.ok
        ? "Coupon created."
        : payload.error || "Could not create coupon",
    );
    if (response.ok) {
      setCoupons((current) => [
        {
          ...payload.coupon,
          assigned_count:
            coupon.assignMode === "all"
              ? customers.length
              : coupon.userIds.length,
        },
        ...current,
      ]);
      setCoupon({
        code: "",
        discountType: "percentage",
        discountValue: "",
        minimumOrder: "0",
        expiryDate: "",
        assignMode: "all",
        userIds: [],
      });
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          Admin marketing
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold">
          Marketing and feedback
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Communicate with customers, manage coupons, and monitor reviews.
        </p>
      </header>
      {message && (
        <p className="mb-6 border border-primary/30 bg-primary/5 p-3 text-sm">
          {message}
        </p>
      )}
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="border border-border bg-card p-6">
          <h2 className="font-serif text-2xl font-bold">Send notification</h2>
          <form onSubmit={sendNotification} className="mt-5 space-y-4">
            <input
              required
              placeholder="Title"
              value={notification.title}
              onChange={(event) =>
                setNotification({ ...notification, title: event.target.value })
              }
              className="w-full border border-border bg-background px-3 py-2 text-sm"
            />
            <select
              value={notification.audience}
              onChange={(event) =>
                setNotification({
                  ...notification,
                  audience: event.target.value,
                  userIds: [],
                })
              }
              className="w-full border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="all">All customers</option>
              <option value="specific">Specific customers</option>
            </select>
            <textarea
              required
              placeholder="Message"
              value={notification.message}
              onChange={(event) =>
                setNotification({
                  ...notification,
                  message: event.target.value,
                })
              }
              className="min-h-24 w-full border border-border bg-background px-3 py-2 text-sm"
            />
            {notification.audience === "specific" && (
              <select
                required
                multiple
                value={notification.userIds.map(String)}
                onChange={(event) =>
                  setNotification({
                    ...notification,
                    userIds: Array.from(
                      event.target.selectedOptions,
                      (option) => Number(option.value),
                    ),
                  })
                }
                className="h-28 w-full border border-border bg-background px-3 py-2 text-sm"
              >
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} · {customer.email}
                  </option>
                ))}
              </select>
            )}
            <button className="bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              Send notification
            </button>
          </form>
        </section>
        <section className="border border-border bg-card p-6">
          <h2 className="font-serif text-2xl font-bold">Create coupon</h2>
          <form onSubmit={createCoupon} className="mt-5 space-y-4">
            <input
              required
              placeholder="Coupon code"
              value={coupon.code}
              onChange={(event) =>
                setCoupon({ ...coupon, code: event.target.value })
              }
              className="w-full border border-border bg-background px-3 py-2 text-sm uppercase"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={coupon.discountType}
                onChange={(event) =>
                  setCoupon({ ...coupon, discountType: event.target.value })
                }
                className="border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed amount</option>
              </select>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Value"
                value={coupon.discountValue}
                onChange={(event) =>
                  setCoupon({ ...coupon, discountValue: event.target.value })
                }
                className="border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Minimum order"
              value={coupon.minimumOrder}
              onChange={(event) =>
                setCoupon({ ...coupon, minimumOrder: event.target.value })
              }
              className="w-full border border-border bg-background px-3 py-2 text-sm"
            />
            <button className="bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              Create coupon
            </button>
          </form>
        </section>
      </div>
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold">Reviews</h2>
          <select
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            className="h-10 border border-border bg-card px-3 text-sm"
          >
            <option value="0">All ratings</option>
            <option value="1">1 star</option>
            <option value="2">2 stars</option>
            <option value="3">3 stars</option>
            <option value="4">4 stars</option>
            <option value="5">5 stars</option>
          </select>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="border border-border bg-card p-4"
            >
              <div className="flex justify-between">
                <strong>{review.restaurant_name}</strong>
                <span>{review.rating}/5</span>
              </div>
              <p className="mt-2 text-sm">{review.comment || "No comment"}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {review.customer_name} · Order #{review.order_id}
              </p>
            </article>
          ))}
          {!reviews.length && (
            <p className="border border-border bg-card p-6 text-sm text-muted-foreground">
              No reviews found.
            </p>
          )}
        </div>
      </section>
      <section className="mt-10">
        <h2 className="mb-4 font-serif text-2xl font-bold">Coupons</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {coupons.map((item) => (
            <div key={item.id} className="border border-border bg-card p-4">
              <strong>{item.code}</strong>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.discount_type === "percentage"
                  ? `${item.discount_value}% off`
                  : `৳${item.discount_value} off`}{" "}
                · {item.assigned_count} customers
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
