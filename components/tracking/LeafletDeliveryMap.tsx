"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
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

function markerIcon(color: string) {
  return L.divIcon({
    className: "delivery-map-marker",
    html: `<span style="background:${color};border:2px solid white;border-radius:9999px;box-shadow:0 1px 4px rgba(0,0,0,.4);display:block;height:18px;width:18px"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
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
  const restaurant = coordinatePair(
    tracking.restaurantLatitude,
    tracking.restaurantLongitude,
  );
  const destination = coordinatePair(
    tracking.dropoffLatitude,
    tracking.dropoffLongitude,
  );
  const rider = coordinatePair(tracking.riderLatitude, tracking.riderLongitude);

  const points: LocationPoint[] = [
    restaurant
      ? { position: restaurant, label: "Restaurant", color: "#1f6f5b" }
      : null,
    destination
      ? {
          position: destination,
          label: "Delivery destination",
          color: "#b83b2f",
        }
      : null,
    rider
      ? { position: rider, label: "Rider - latest location", color: "#244f80" }
      : null,
  ].filter((point): point is LocationPoint => point !== null);

  const [roadRoute, setRoadRoute] = useState<{
    key: string;
    points: [number, number][];
  } | null>(null);

  // Start point is rider (if available) or restaurant
  const startPoint = rider || restaurant;
  const endPoint = destination;
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

  return (
    <div className="h-[400px] overflow-hidden border border-border">
      <MapContainer
        className="h-full w-full"
        center={FALLBACK_CENTER}
        zoom={12}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport points={points} />
        {points.map((point) => (
          <Marker
            key={`${point.label}-${point.position.join(",")}`}
            position={point.position}
            icon={markerIcon(point.color)}
          >
            <Popup>{point.label}</Popup>
          </Marker>
        ))}

        {/* Render actual road polyline */}
        {displayedRoute.length > 0 && (
          <Polyline
            positions={displayedRoute}
            pathOptions={{ color: "#c4512d", weight: 4, opacity: 0.8 }}
          />
        )}
      </MapContainer>
    </div>
  );
}
