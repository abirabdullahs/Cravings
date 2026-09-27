// components/rider/TodaysSummaryCard.tsx
"use client";
import type { RiderEarningsSummary } from "@/types/rider";


import { useRiderDeliveries } from "@/hooks/useRider";
import { CheckCircle2, Clock, MapPin, Store } from "lucide-react";
interface TodaysSummaryCardProps {

  earnings: RiderEarningsSummary | undefined;

  isEarningsLoading: boolean;

}
export function TodaysSummaryCard({
  earnings,
  isEarningsLoading,
}: TodaysSummaryCardProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const { data: deliveries, isLoading: isDeliveriesLoading } =
    useRiderDeliveries(todayStr);

  const totalDeliveries = earnings?.totalDeliveries ?? 0;
  const totalIncome = earnings?.totalIncome ?? 0;
  const isLoading = isEarningsLoading || isDeliveriesLoading;

  return (
    <div className="border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-foreground">
            Today&apos;s Activity
          </h3>
          <p className="text-xs text-muted-foreground">{todayStr}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            Earnings
          </p>
          <p className="font-mono text-xl font-bold text-primary">
            ৳{Number(totalIncome).toLocaleString()}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-2">
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-16 w-full animate-pulse rounded bg-muted/40" />
        </div>
      ) : totalDeliveries > 0 ? (
        <>
          <p className="mt-4 text-xs font-medium text-foreground">
            Completed{" "}
            <span className="font-bold text-primary">{totalDeliveries}</span>{" "}
            {totalDeliveries === 1 ? "delivery" : "deliveries"} today:
          </p>

          <div className="mt-3 divide-y divide-border/60 max-h-60 overflow-y-auto pr-1">
            {deliveries?.map((item) => (
              <div key={item.deliveryId} className="py-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    <span>Order #{item.orderId}</span>
                  </div>
                  <span className="font-mono font-bold text-foreground">
                    +৳{item.deliveryFee}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 truncate">
                    <Store className="size-3 shrink-0" /> {item.restaurantName}
                  </span>
                  {item.deliveredAt && (
                    <span className="flex items-center gap-0.5 shrink-0">
                      <Clock className="size-3" />
                      {new Date(item.deliveredAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-4 border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          No completed deliveries logged for today yet.
        </div>
      )}
    </div>
  );
}
