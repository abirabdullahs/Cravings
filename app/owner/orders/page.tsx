"use client";

import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { RestaurantOrdersPanel } from "@/components/restaurant-manager/RestaurantOrdersPanel";
import { RestaurantSidebar } from "@/components/restaurant-manager/RestaurantSidebar";
import { useRestaurantManager } from "@/hooks/useRestaurantManager";

export default function RestaurantOrdersPage() {
  const {
    restaurants,
    selectedRestaurant,
    orders,
    markOrderReady,
    error,
    setSelectedId,
    setError,
  } = useRestaurantManager({ includeOrders: true });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 border-b border-border pb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          Kitchen queue
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Current orders
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review incoming orders and mark them ready for rider pickup.
        </p>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError("")} />

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <RestaurantSidebar
          restaurants={restaurants}
          selectedId={selectedRestaurant?.id ?? null}
          onSelect={setSelectedId}
        />
        <section className="min-w-0">
          {selectedRestaurant ? (
            <RestaurantOrdersPanel orders={orders} onReady={markOrderReady} />
          ) : (
            <div className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Add a restaurant before managing orders.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
