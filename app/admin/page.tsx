"use client";

import { useEffect, useState } from "react";
import { AdminStatsOverview } from "@/components/admin/AdminStatsOverview";

type Profit = { totals: { product_sales: string; platform_profit: string } };
type Analytics = {
  total_orders: number;
  completed_orders: number;
  active_customers: number;
  average_order_value: string;
  cancellation_rate: number;
};

export default function AdminOverviewPage() {
  const [range, setRange] = useState("weekly");
  const [stats, setStats] = useState({
    restaurants: 0,
    riders: 0,
    profit: null as Profit | null,
    analytics: null as Analytics | null,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const responses = await Promise.all([
          fetch("/api/admin/restaurants"),
          fetch("/api/admin/riders"),
          fetch(`/api/admin/profit?range=${range}`),
          fetch(`/api/admin/analytics?range=${range}`),
        ]);
        if (!responses.every((response) => response.ok))
          throw new Error("Could not load admin overview");
        const restaurantPayload = await responses[0].json();
        const riderPayload = await responses[1].json();
        setStats({
          restaurants: restaurantPayload.restaurants?.length ?? 0,
          riders: riderPayload.riders?.length ?? 0,
          profit: await responses[2].json(),
          analytics: await responses[3].json(),
        });
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load admin overview",
        );
      }
    }
    void load();
  }, [range]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Admin console
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Platform overview
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A focused view of platform health and activity.
          </p>
        </div>
        <select
          value={range}
          onChange={(event) => setRange(event.target.value)}
          className="h-10 border border-border bg-card px-3 text-sm"
        >
          <option value="weekly">Last 7 days</option>
          <option value="28d">Last 28 days</option>
        </select>
      </div>
      {error && (
        <p className="mb-6 border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <AdminStatsOverview
        restaurants={stats.restaurants}
        riders={stats.riders}
        productSales={stats.profit?.totals.product_sales ?? 0}
        platformProfit={stats.profit?.totals.platform_profit ?? 0}
        orders={stats.analytics?.total_orders ?? 0}
        completed={stats.analytics?.completed_orders ?? 0}
        activeCustomers={stats.analytics?.active_customers ?? 0}
        averageOrder={stats.analytics?.average_order_value ?? 0}
        cancellationRate={stats.analytics?.cancellation_rate ?? 0}
      />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <a
          href="/admin/operations"
          className="border border-border bg-card p-5 hover:border-primary"
        >
          <strong>Operations</strong>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage restaurants, riders, and partner approvals.
          </p>
        </a>
        <a
          href="/admin/orders"
          className="border border-border bg-card p-5 hover:border-primary"
        >
          <strong>Orders</strong>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor order, payment, and delivery progress.
          </p>
        </a>
        <a
          href="/admin/marketing"
          className="border border-border bg-card p-5 hover:border-primary"
        >
          <strong>Marketing</strong>
          <p className="mt-1 text-sm text-muted-foreground">
            Send notifications, create coupons, and review feedback.
          </p>
        </a>
      </div>
    </div>
  );
}
