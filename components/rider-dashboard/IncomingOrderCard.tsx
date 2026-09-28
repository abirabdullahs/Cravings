import { useEffect, useState } from "react";
import { Bike, Clock, MapPin, Store } from "lucide-react";
import type { DeliveryOpportunity } from "@/types/rider";

interface IncomingOrderCardProps {
  opportunity: DeliveryOpportunity;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function useMinutesAgo(iso: string) {
  const [minutes, setMinutes] = useState(() => minutesSince(iso));

  useEffect(() => {
    const update = () => setMinutes(minutesSince(iso));
    const initialUpdate = window.setTimeout(update, 0);
    const timer = setInterval(() => {
      update();
    }, 60000);

    return () => {
      window.clearTimeout(initialUpdate);
      clearInterval(timer);
    };
  }, [iso]);

  return minutes;
}

function minutesSince(iso: string) {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 60000),
  );
}
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

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Store className="size-4 text-primary" />
          <h3 className="font-serif text-2xl font-bold text-foreground">
            {opportunity.restaurantName}
          </h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-muted-foreground">Order total</p>
          <p className="font-serif text-2xl font-bold text-primary">
            ৳{opportunity.totalAmount}
          </p>
          <p className="mt-1 text-xs font-semibold text-foreground">
            Delivery fee: ৳{opportunity.deliveryFee}
          </p>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Order #{opportunity.orderId}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 border border-border p-3">
          <Bike className="size-4 shrink-0 text-primary" />
          <span>{opportunity.pickupDistanceKm.toFixed(1)} km to pickup</span>
        </div>
        <div className="flex items-center gap-2 border border-border p-3">
          <MapPin className="size-4 shrink-0 text-primary" />
          <span>{opportunity.deliveryDistanceKm.toFixed(1)} km delivery</span>
        </div>
      </div>

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
