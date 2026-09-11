"use client";

import { useEffect, useState } from "react";

type DashboardRole = "admin" | "owner" | "rider" | "customer";

type DashboardPageProps = {
  role: DashboardRole;
};

export default function DashboardPage({ role }: DashboardPageProps) {
  const [stats, setStats] = useState<Record<string, number | string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/dashboard/${role}`);
        if (response.ok) {
          const payload = await response.json();
          setStats(payload.stats ?? {});
        }
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [role]);

  const labels: Record<DashboardRole, Record<string, string>> = {
    admin: { overview: "Overview", users: "Users", restaurants: "Restaurants", riders: "Riders", orders: "Orders", payments: "Payments", reviews: "Reviews", notifications: "Notifications", requests: "Requests", reports: "Reports / Statistics", profile: "Admin Profile" },
    owner: { overview: "Overview", restaurants: "Restaurant information", menu: "Menu / categories / items", orders: "Orders", sales: "Sales / revenue statistics", reviews: "Reviews", notifications: "Notifications", profile: "Profile", activity: "Recent activity" },
    rider: { overview: "Overview", deliveries: "Available deliveries", assigned: "Assigned deliveries", active: "Active delivery", history: "Delivery history", earnings: "Earnings / statistics", notifications: "Notifications", profile: "Profile", activity: "Recent activity" },
    customer: { overview: "Overview", orders: "Recent orders", history: "Order history", addresses: "Saved addresses", cart: "Cart", payments: "Payments", reviews: "Reviews", coupons: "Coupons", notifications: "Notifications", profile: "Profile", activity: "Recent activity" },
  };

  const metricCards = Object.entries(labels[role]).slice(0, 4).map(([key, label]) => ({ key, label, value: stats[key] ?? 0 }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 border-b border-border pb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{role} dashboard</p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{role === "owner" ? "Restaurant owner workspace" : role === "rider" ? "Rider workspace" : role === "admin" ? "Admin workspace" : "Customer workspace"}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Role-aware activity, overview, and management sections are available here.</p>
      </div>

      {loading ? <div className="text-sm text-muted-foreground">Loading dashboard…</div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((card) => (
            <div key={card.key} className="border border-border bg-card p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{card.label}</p>
              <p className="mt-3 text-2xl font-bold">{String(card.value)}</p>
            </div>
          ))}
        </div>
      )}

      <section className="mt-8 rounded border border-border bg-card p-6">
        <h2 className="font-serif text-2xl font-bold">{role === "admin" ? "Requests" : "Latest activity"}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {Object.entries(labels[role]).map(([key, label]) => (
            <div key={key} className="border border-border px-4 py-3 text-sm">
              <span className="font-semibold">{label}</span>
              <span className="ml-2 text-muted-foreground">section</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
