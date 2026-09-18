"use client";

import dynamic from "next/dynamic";

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  label?: string;
}

export const LocationPicker = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[220px] w-full items-center justify-center border border-border bg-muted text-xs text-muted-foreground">
      Loading interactive map...
    </div>
  ),
});
