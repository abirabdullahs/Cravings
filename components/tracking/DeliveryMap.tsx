"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import type { DeliveryTracking } from "@/types/delivery-tracking";

interface DeliveryMapProps {
  tracking: DeliveryTracking;
}

const LeafletDeliveryMap = dynamic(
  () => import("@/components/tracking/LeafletDeliveryMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] items-center justify-center bg-muted text-sm text-muted-foreground">
        Loading map...
      </div>
    ),
  },
);

export function DeliveryMap({ tracking }: DeliveryMapProps) {
  return (
    <div className="border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Delivery map
          </p>
          <p className="text-sm text-foreground">
            {tracking.distanceKm !== null
              ? `${Number(tracking.distanceKm).toFixed(1)} km restaurant to destination`
              : "Distance unavailable until both addresses have coordinates"}
          </p>
        </div>
        {tracking.riderLocationRecordedAt && (
          <p className="text-right text-xs text-muted-foreground">
            Rider location updated
            <br />
            {new Date(tracking.riderLocationRecordedAt).toLocaleTimeString()}
          </p>
        )}
      </div>

      <LeafletDeliveryMap tracking={tracking} />

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3 text-[#1f6f5b]" /> Restaurant
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3 text-[#b83b2f]" /> Destination
        </span>
        {tracking.riderLatitude !== null &&
          tracking.riderLongitude !== null && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3 text-[#244f80]" /> Latest rider position
            </span>
          )}
      </div>
    </div>
  );
}
