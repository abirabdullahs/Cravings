"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const customIcon = L.divIcon({
  className: "location-picker-marker",
  html: `<span style="background:#b83b2f;border:2px solid white;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,.4);display:block;height:20px;width:20px"></span>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const DEFAULT_CENTER: [number, number] = [23.8103, 90.4125];

interface LocationPickerMapProps {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

function MapEvents({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onLocationSelect,
}: LocationPickerMapProps) {
  const hasCoordinates = latitude !== null && longitude !== null;
  const position: [number, number] = hasCoordinates
    ? [latitude, longitude]
    : DEFAULT_CENTER;

  const eventHandlers = useMemo(
    () => ({
      dragend(e: L.DragEndEvent) {
        const marker = e.target;
        if (marker) {
          const latLng = marker.getLatLng();
          onLocationSelect(latLng.lat, latLng.lng);
        }
      },
    }),
    [onLocationSelect],
  );

  return (
    <div className="relative h-[220px] w-full overflow-hidden border border-border">
      <MapContainer
        center={position}
        zoom={14}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onSelect={onLocationSelect} />
        {hasCoordinates && (
          <>
            <MapRecenter center={position} />
            <Marker
              position={position}
              draggable={true}
              eventHandlers={eventHandlers}
              icon={customIcon}
            />
          </>
        )}
      </MapContainer>
      {!hasCoordinates && (
        <div className="absolute inset-0 z-[400] flex items-center justify-center bg-black/20 text-xs font-semibold text-white pointer-events-none">
          Click anywhere on the map to set location
        </div>
      )}
    </div>
  );
}
