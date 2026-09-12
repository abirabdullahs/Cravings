"use client";
import { useEffect, useState } from "react";
import { RouteCard } from "@/components/tracking/RouteCard";
import { StatusTimeline } from "@/components/tracking/StatusTimeline";
import { OrderSummaryCard } from "@/components/tracking/OrderSummaryCard";
import type {
  DeliveryStep,
  DeliveryTracking,
  TrackingItem,
} from "@/types/delivery-tracking";

const CUSTOMER_ORDER_STEPS = [
  { key: "pending", label: "Order placed" },
  { key: "confirmed", label: "Order confirmed" },
  { key: "preparing", label: "Restaurant is preparing" },
  { key: "ready", label: "Food ready for pickup" },
  { key: "accepted", label: "Rider accepted the order" },
  { key: "arrived_at_store", label: "Rider arrived at restaurant" },
  { key: "picked_up", label: "Rider picked up the food" },
  { key: "delivered", label: "Delivered to you" },
];

// Rider-only: what tapping the action button does at each step.
const NEXT_STEP: Partial<
  Record<DeliveryStep, { label: string; next: DeliveryStep }>
> = {
  accepted: { label: "I Have Arrived", next: "arrived_at_store" },
  arrived_at_store: { label: "Picked Up Food", next: "picked_up" },
  picked_up: { label: "Mark as Delivered", next: "delivered" },
};

function useElapsedMinutes(since: string | null) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((value) => value + 1), 30000);
    return () => clearInterval(interval);
  }, [since]);

  return elapsedSince(since);
}

function elapsedSince(iso: string | null): number {
  if (!iso) return 0;
  return Math.max(
    0,
    Math.round((Date.now() - new Date(iso).getTime()) / 60000),
  );
}

interface ActiveOrderViewProps {
  viewer: "rider" | "customer";
  tracking: DeliveryTracking;
  onAdvance?: (next: DeliveryStep) => void;
  isAdvancing?: boolean;
  receiptItems?: TrackingItem[];
}

export function ActiveOrderView({
  viewer,
  tracking,
  onAdvance,
  isAdvancing,
  receiptItems,
}: ActiveOrderViewProps) {
  const elapsedMinutes = useElapsedMinutes(tracking.assignedAt);

  const callTargets =
    viewer === "rider"
      ? [
          { label: "Call Restaurant", phone: tracking.restaurantPhone ?? null },
          { label: "Call Customer", phone: tracking.customerPhone ?? null },
        ]
      : [
          { label: "Call Restaurant", phone: tracking.restaurantPhone ?? null },
          { label: "Call Rider", phone: tracking.riderPhone ?? null },
        ];

  const nextStep = NEXT_STEP[tracking.deliveryStatus];
  const customerStatus =
    tracking.deliveryStatus !== "unassigned"
      ? tracking.deliveryStatus
      : tracking.orderStatus;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <RouteCard
        pickupLabel={tracking.restaurantName}
        pickupAddress={tracking.restaurantAddress}
        dropoffAddress={tracking.dropoffAddress}
      />

      <div className="border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {viewer === "rider" ? "Active order" : "Tracking order"}
          </p>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            Timer: {elapsedMinutes}m elapsed
          </span>
        </div>
        <h2 className="mt-1 font-serif text-2xl font-bold text-foreground">
          #CRV-{tracking.orderId}
        </h2>

        <div className="mt-5 border-t border-border pt-5">
          {viewer === "customer" && (
            <StatusTimeline
              currentStatus={customerStatus}
              steps={CUSTOMER_ORDER_STEPS}
            />
          )}
          {viewer === "rider" && tracking.deliveryStatus !== "unassigned" && (
            <StatusTimeline currentStatus={tracking.deliveryStatus} />
          )}
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <OrderSummaryCard
            itemCount={tracking.itemCount}
            totalAmount={tracking.totalAmount}
            paymentMethod={tracking.paymentMethod}
            callTargets={callTargets}
            items={receiptItems}
            expandable={viewer === "customer" && Boolean(receiptItems)}
          />
        </div>

        {viewer === "rider" && nextStep && onAdvance && (
          <button
            onClick={() => onAdvance(nextStep.next)}
            disabled={isAdvancing}
            className="mt-4 w-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {nextStep.label}
          </button>
        )}

        {viewer === "rider" && tracking.deliveryStatus === "delivered" && (
          <p className="mt-4 text-center text-sm font-semibold text-emerald-700">
            Delivered — nice work.
          </p>
        )}
      </div>
    </div>
  );
}
