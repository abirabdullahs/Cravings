"use client";

import { OrderHistoryCard } from "@/components/order/orderHistoryCard";
import { useOrderHistory } from "@/hooks/useOrder";

export default function OrderHistoryPage() {
  const { data: orders = [], isLoading, isError } = useOrderHistory();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="border-b border-border pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          Your orders
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-foreground">
          Order history
        </h1>
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-24 animate-pulse bg-muted" />
          ))}
        </div>
      ) : isError ? (
        <p className="mt-6 text-sm text-destructive">
          Unable to load your orders.
        </p>
      ) : orders.length ? (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <OrderHistoryCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          You have no orders yet.
        </p>
      )}
    </div>
  );
}
