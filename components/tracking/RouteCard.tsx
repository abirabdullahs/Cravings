import { MapPin } from "lucide-react";
import { DeliveryMap } from "@/components/tracking/DeliveryMap";
import type { DeliveryTracking } from "@/types/delivery-tracking";

interface RouteCardProps {
  tracking: DeliveryTracking;
  pickupLabel: string;
  pickupAddress: string;
  dropoffAddress: string;
}

// Deliberately not a real map. Turn-by-turn navigation and live rider
// position need a maps/directions API and realtime position updates —
// both later phases. This shows what we actually know: where the order
// starts and ends, and that there's a route between them.
export function RouteCard({
  tracking,
  pickupLabel,
  pickupAddress,
  dropoffAddress,
}: RouteCardProps) {
  return (
    <div className="space-y-4">
      <DeliveryMap tracking={tracking} />
      <div className="border border-border bg-card p-6">
        <div className="relative pl-6">
          <div className="absolute left-[9px] top-2 h-[calc(100%-2.5rem)] w-px border-l-2 border-dashed border-primary/40" />

          <div className="relative flex gap-3 pb-8">
            <span className="absolute -left-6 top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <MapPin className="size-3" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pickup
              </p>
              <p className="text-sm font-semibold text-foreground">
                {pickupLabel}
              </p>
              <p className="text-sm text-muted-foreground">{pickupAddress}</p>
            </div>
          </div>

          <div className="relative flex gap-3">
            <span className="absolute -left-6 top-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-white">
              <MapPin className="size-3" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Drop-off
              </p>
              <p className="text-sm text-muted-foreground">{dropoffAddress}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
