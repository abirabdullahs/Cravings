"use client";
import { useEffect, useState } from "react";
import { RouteCard } from "@/components/tracking/RouteCard";
import { StatusTimeline } from "@/components/tracking/StatusTimeline";
import { ReviewModal } from "@/components/reviews/ReviewModal";
import { OrderSummaryCard } from "@/components/tracking/OrderSummaryCard";
import type {
  DeliveryStep,
  DeliveryTracking
} from "@/types/delivery-tracking";
import type { OrderDetail } from "@/types/order";

// Updated logical sequence for customers
const CUSTOMER_ORDER_STEPS = [
  { key: "pending", label: "Order placed" },
  { key: "confirmed", label: "Order confirmed" },
  { key: "preparing", label: "Preparing food" },
  { key: "rider_assigned", label: "Rider assigned & heading to store" },
  { key: "out_for_delivery", label: "Picked up & on the way" },
  { key: "arrived_at_destination", label: "Rider has arrived" },
  { key: "delivered", label: "Delivered to you" },
];

function getCustomerStatus(
  orderStatus: DeliveryTracking["orderStatus"],
  deliveryStatus: DeliveryTracking["deliveryStatus"],
) {
  if (orderStatus === "cancelled" || deliveryStatus === "cancelled") {
    return "cancelled";
  }

  // 1. Order or delivery is complete
  if (orderStatus === "delivered" || deliveryStatus === "delivered") {
    return "delivered";
  }

  if (deliveryStatus === "arrived_at_destination") {
    return "arrived_at_destination";
  }

  // 2. Food picked up and on the way
  if (deliveryStatus === "picked_up" || orderStatus === "out_for_delivery") {
    return "out_for_delivery";
  }

  // 3. Rider assigned or arrived at restaurant, but hasn't picked up food yet
  if (deliveryStatus === "accepted" || deliveryStatus === "arrived_at_store") {
    return "rider_assigned";
  }

  // 4. Kitchen is working on the order
  if (orderStatus === "ready" || orderStatus === "preparing") {
    return "preparing";
  }
  // 5. Order confirmed by restaurant
  if (orderStatus === "confirmed") {
    return "confirmed";
  }

  return "pending";
}

// Rider action map
const NEXT_STEP: Partial<
  Record<DeliveryStep, { label: string; next: DeliveryStep }>
> = {
  accepted: { label: "I Have Arrived", next: "arrived_at_store" },
  arrived_at_store: { label: "Picked Up Food", next: "picked_up" },
  picked_up: {
    label: "Arrived at Customer",
    next: "arrived_at_destination",
  },
  arrived_at_destination: { label: "Mark as Delivered", next: "delivered" },
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
  onAdvance?: (next: DeliveryStep) => Promise<void>;
  isAdvancing?: boolean;
  receipt?: OrderDetail;
  onCancel?: () => Promise<void>;
  isCancelling?: boolean;
}

export function ActiveOrderView({
  viewer,
  tracking,
  onAdvance,
  isAdvancing,
  receipt,
  onCancel,
  isCancelling,
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
  const [advanceError, setAdvanceError] = useState<string | null>(null);
  const customerStatus = getCustomerStatus(
    tracking.orderStatus,
    tracking.deliveryStatus,
  );
  const waitingForFood =
    viewer === "rider" &&
    (tracking.deliveryStatus === "accepted" ||
      tracking.deliveryStatus === "arrived_at_store") &&
    tracking.orderStatus !== "ready";
  const canAdvance = !(waitingForFood && nextStep?.next === "picked_up");
  const canCancel = ["unassigned", "accepted", "arrived_at_store"].includes(
    tracking.deliveryStatus,
  ) && ["pending", "confirmed", "preparing", "ready"].includes(
    tracking.orderStatus,
  );

  const [hasSkippedReview, setHasSkippedReview] = useState(false);
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);

  const isDelivered =
    tracking.deliveryStatus === "delivered" ||
    tracking.orderStatus === "delivered";

  // Show review modal automatically ONLY for customer view when order becomes delivered
  const showReviewModal =
    viewer === "customer" &&
    isDelivered &&
    tracking.isReviewed === false &&
    !hasSkippedReview &&
    !hasSubmittedReview;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <RouteCard
        tracking={tracking}
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
          {viewer === "customer" &&
            (customerStatus === "cancelled" ? (
              <p className="text-sm font-semibold text-destructive">
                This order was cancelled.
              </p>
            ) : (
              <StatusTimeline
                currentStatus={customerStatus}
                steps={CUSTOMER_ORDER_STEPS}
              />
            ))}
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
            receipt={receipt}
            expandable={viewer === "customer" && Boolean(receipt)}
          />
        </div>

        {viewer === "rider" && nextStep && onAdvance && (
          <button
            onClick={async () => {
              setAdvanceError(null);
              try {
                await onAdvance(nextStep.next);
              } catch (error) {
                setAdvanceError(
                  error instanceof Error
                    ? error.message
                    : "Unable to update delivery status.",
                );
              }
            }}
            disabled={isAdvancing || !canAdvance}
            className="mt-4 w-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {nextStep.label}
          </button>
        )}

        {onCancel && canCancel && (
          <button
            type="button"
            onClick={async () => {
              setAdvanceError(null);
              try {
                await onCancel();
              } catch (error) {
                setAdvanceError(
                  error instanceof Error
                    ? error.message
                    : "Unable to cancel this order.",
                );
              }
            }}
            disabled={isCancelling || isAdvancing}
            className="mt-2 w-full border border-destructive py-2.5 text-sm font-semibold text-destructive disabled:opacity-50"
          >
            {isCancelling
              ? "Cancelling..."
              : viewer === "rider"
                ? "Cancel delivery"
                : "Cancel order"}
          </button>
        )}

        {waitingForFood && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Waiting for the restaurant to mark the food ready.
          </p>
        )}

        {advanceError && (
          <p className="mt-2 text-center text-xs text-destructive">
            {advanceError}
          </p>
        )}

        {(tracking.deliveryStatus === "delivered" ||
          tracking.orderStatus === "delivered") && (
          <p className="mt-4 text-center text-sm font-semibold text-emerald-700">
            Delivered — order complete.
          </p>
        )}
      </div>
      {showReviewModal && (
        <ReviewModal
          orderId={tracking.orderId}
          restaurantId={tracking.restaurantId}
          restaurantName={tracking.restaurantName}
          riderId={tracking.riderId}
          riderName={tracking.riderName}
          onClose={() => setHasSkippedReview(true)}
          onSubmitSuccess={() => setHasSubmittedReview(true)}
        />
      )}
    </div>
  );
}
