import { useEffect, useState } from "react";
import { Clock, Store } from "lucide-react";
import type { DeliveryOpportunity } from "@/types/rider";

interface IncomingOrderCardProps {
  opportunity: DeliveryOpportunity;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

function useMinutesAgo(iso: string) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((value) => value + 1), 30000);
    return () => clearInterval(interval);
  }, [iso]);
  return minutesSince(iso);
}

function minutesSince(iso: string): number {
  return Math.max(
    0,
    Math.round((Date.now() - new Date(iso).getTime()) / 60000),
  );
}

// NOTE: the original design had pickup/dropoff addresses, distance, ETA,
// and an expiry countdown. GET_AVAILABLE_REQUESTS only returns orderId,
// restaurantId, restaurantName, totalAmount, createdAt — so this shows
// only what's real. "requested Xm ago" replaces the fabricated countdown.
export function IncomingOrderCard({
  opportunity,
  busy,
  onAccept,
  onDecline,
}: IncomingOrderCardProps) {
  const minutesAgo = useMinutesAgo(opportunity.createdAt);

  return (
    <div className="border border-primary bg-card p-6">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-destructive">
          <span className="size-2 rounded-full bg-destructive" />
          Incoming order opportunity
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {minutesAgo === 0 ? "Just now" : `${minutesAgo}m ago`}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="size-4 text-primary" />
          <h3 className="font-serif text-2xl font-bold text-foreground">
            {opportunity.restaurantName}
          </h3>
        </div>
        <span className="font-serif text-2xl font-bold text-primary">
          ৳{opportunity.totalAmount}
        </span>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Order #{opportunity.orderId}
      </p>

      <div className="mt-5 flex gap-3">
        <button
          onClick={onAccept}
          disabled={busy}
          className="flex-1 bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          Accept Order
        </button>
        <button
          onClick={onDecline}
          disabled={busy}
          className="flex-1 border border-border py-3 text-sm font-semibold text-foreground transition hover:border-primary disabled:opacity-50"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
