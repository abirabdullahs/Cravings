"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import type { DeliveryTracking } from "@/types/delivery-tracking";

interface LeafletDeliveryMapProps {
  tracking: DeliveryTracking;
}

type LocationPoint = {
  position: [number, number];
  label: string;
  color: string;
  shortLabel: string;
};

const FALLBACK_CENTER: [number, number] = [23.8103, 90.4125];

function coordinatePair(
  latitude: number | null,
  longitude: number | null,
): [number, number] | null {
  if (
    latitude === null ||
    longitude === null ||
    !Number.isFinite(Number(latitude)) ||
    !Number.isFinite(Number(longitude))
  ) {
    return null;
  }

  return [Number(latitude), Number(longitude)];
}

function markerIcon(color: string, shortLabel: string) {
  return L.divIcon({
    className: "delivery-map-marker",
    html: `<span style="align-items:center;background:${color};border:3px solid white;border-radius:50% 50% 50% 0;box-shadow:0 4px 14px rgba(40,31,23,.32);color:white;display:flex;font-family:system-ui,sans-serif;font-size:11px;font-weight:800;height:34px;justify-content:center;transform:rotate(-45deg);width:34px"><span style="transform:rotate(45deg)">${shortLabel}</span></span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

function MapViewport({ points }: { points: LocationPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length >= 2) {
      map.fitBounds(L.latLngBounds(points.map((point) => point.position)), {
        padding: [36, 36],
        maxZoom: 16,
      });
    } else if (points.length === 1) {
      map.setView(points[0].position, 15);
    } else {
      map.setView(FALLBACK_CENTER, 12);
    }
  }, [map, points]);

  return null;
}

export default function LeafletDeliveryMap({
  tracking,
}: LeafletDeliveryMapProps) {
  const rider = coordinatePair(tracking.riderLatitude, tracking.riderLongitude);
  const savedRestaurant = coordinatePair(
    tracking.restaurantLatitude,
    tracking.restaurantLongitude,
  );
  // An arrived/pickup GPS point is also a safe restaurant-position fallback
  // for older restaurant rows that predate required map coordinates.
  const restaurant =
    savedRestaurant ||
    (["arrived_at_store", "picked_up"].includes(tracking.deliveryStatus)
      ? rider
      : null);
  const destination = coordinatePair(
    tracking.dropoffLatitude,
    tracking.dropoffLongitude,
  );

  const points: LocationPoint[] = [
    restaurant
      ? {
          position: restaurant,
          label: "Restaurant",
          color: "#1f6f5b",
          shortLabel: "S",
        }
      : null,
    destination
      ? {
          position: destination,
          label: "Delivery destination",
          color: "#b83b2f",
          shortLabel: "D",
        }
      : null,
    rider
      ? {
          position: rider,
          label: "Rider - latest location",
          color: "#244f80",
          shortLabel: "R",
        }
      : null,
  ].filter((point): point is LocationPoint => point !== null);

  const [roadRoute, setRoadRoute] = useState<{
    key: string;
    points: [number, number][];
  } | null>(null);

  const headingToCustomer = [
    "picked_up",
    "arrived_at_destination",
    "delivered",
  ].includes(tracking.deliveryStatus);

  // Before pickup the rider heads to the restaurant; afterward to the customer.
  const startPoint = rider || restaurant;
  const endPoint = headingToCustomer ? destination : restaurant;
  const startLatitude = startPoint?.[0] ?? null;
  const startLongitude = startPoint?.[1] ?? null;
  const endLatitude = endPoint?.[0] ?? null;
  const endLongitude = endPoint?.[1] ?? null;
  const startKey = startPoint ? startPoint.join(",") : "";
  const endKey = endPoint ? endPoint.join(",") : "";
  const routeKey = `${startKey}|${endKey}`;

  useEffect(() => {
    if (
      startLatitude === null ||
      startLongitude === null ||
      endLatitude === null ||
      endLongitude === null
    ) {
      return;
    }

    const routeStart: [number, number] = [startLatitude, startLongitude];
    const routeEnd: [number, number] = [endLatitude, endLongitude];
    const controller = new AbortController();

    async function fetchRoadRoute() {
      try {
        // OSRM expects: longitude,latitude;longitude,latitude
        const url = `https://router.project-osrm.org/route/v1/driving/${routeStart[1]},${routeStart[0]};${routeEnd[1]},${routeEnd[0]}?overview=full&geometries=geojson`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`OSRM returned ${res.status}`);
        const data = await res.json();

        if (data.routes?.[0]?.geometry?.coordinates) {
          // OSRM returns [lon, lat], so invert back to [lat, lon] for Leaflet
          const coordinates: [number, number][] =
            data.routes[0].geometry.coordinates.map(
              (coord: [number, number]) => [coord[1], coord[0]],
            );
          setRoadRoute({ key: routeKey, points: coordinates });
        } else {
          setRoadRoute({ key: routeKey, points: [routeStart, routeEnd] });
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Failed to fetch road route:", err);
        // Fallback to straight line if API fails
        setRoadRoute({ key: routeKey, points: [routeStart, routeEnd] });
      }
    }

    void fetchRoadRoute();

    return () => controller.abort();
  }, [
    endLatitude,
    endKey,
    endLongitude,
    routeKey,
    startKey,
    startLatitude,
    startLongitude,
  ]);

  const displayedRoute =
    startPoint && endPoint
      ? roadRoute?.key === routeKey
        ? roadRoute.points
        : [startPoint, endPoint]
      : [];

  const routeLabel =
    tracking.deliveryStatus === "delivered"
      ? "Delivery completed"
      : tracking.deliveryStatus === "arrived_at_destination"
        ? "Rider at destination"
        : !rider
          ? "Waiting for rider"
          : headingToCustomer
            ? "Rider to destination"
            : "Rider to restaurant";

  return (
    <div className="relative h-[400px] overflow-hidden">
      <MapContainer
        className="delivery-map h-full w-full"
        center={FALLBACK_CENTER}
        zoom={12}
        scrollWheelZoom
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <ZoomControl position="bottomright" />
        <MapViewport points={points} />
        {points.map((point) => (
          <Marker
            key={`${point.label}-${point.position.join(",")}`}
            position={point.position}
            icon={markerIcon(point.color, point.shortLabel)}
          >
            <Popup>{point.label}</Popup>
          </Marker>
        ))}

        {displayedRoute.length > 0 && (
          <>
            <Polyline
              positions={displayedRoute}
              pathOptions={{ color: "#ffffff", weight: 8, opacity: 0.9 }}
            />
            <Polyline
              positions={displayedRoute}
              pathOptions={{ color: "#c4512d", weight: 4, opacity: 0.95 }}
            />
          </>
        )}
      </MapContainer>
      <div className="pointer-events-none absolute left-3 top-3 z-[500] border border-white/80 bg-card/95 px-3 py-2 shadow-md backdrop-blur-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Current route
        </p>
        <p className="text-xs font-bold text-foreground">{routeLabel}</p>
      </div>
    </div>
  );
}
