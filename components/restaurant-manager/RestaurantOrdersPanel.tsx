import { Check, Clock3 } from "lucide-react";
import type { RestaurantOrder } from "@/types/order";

interface RestaurantOrdersPanelProps {
  orders: RestaurantOrder[];
  onReady: (orderId: number) => void;
}

export function RestaurantOrdersPanel({
  orders,
  onReady,
}: RestaurantOrdersPanelProps) {
  return (
    <section className="border-t border-border pt-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Kitchen queue
          </p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-foreground">
            Active orders
          </h2>
        </div>
        <span className="text-xs text-muted-foreground">
          Updates every 10 seconds
        </span>
      </div>

      {!orders.length ? (
        <div className="mt-5 border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No active orders right now.
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {orders.map((order) => {
            const isReady = order.orderStatus === "ready";
            return (
              <article
                key={order.id}
                className="flex flex-col gap-4 border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      Order #{order.id}
                    </h3>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {order.customerName} · {order.totalItems} item
                    {order.totalItems === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isReady}
                  onClick={() => onReady(order.id)}
                  className="inline-flex items-center justify-center gap-2 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                >
                  {isReady ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Clock3 className="size-3.5" />
                  )}
                  {isReady ? "Ready" : "Mark ready"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
