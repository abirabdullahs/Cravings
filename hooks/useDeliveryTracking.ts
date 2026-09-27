"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  advanceDeliveryStatus,
  fetchActiveDelivery,
  fetchOrderTracking,
} from "@/services/trackingService";
import type { DeliveryStep } from "@/types/delivery-tracking";

export function useActiveDelivery() {
  return useQuery({
    queryKey: ["rider", "activeDelivery"],
    queryFn: fetchActiveDelivery,
    refetchInterval: 10000, // polling placeholder until realtime replaces it
  });
}

export function useOrderTracking(orderId: number) {
  return useQuery({
    queryKey: ["orders", orderId, "tracking"],
    queryFn: () => fetchOrderTracking(orderId),
    refetchInterval: (query) =>
      query.state.data?.orderStatus === "delivered" ? false : 15000,
    enabled: Number.isInteger(orderId),
  });
}


export function useAdvanceDelivery(orderId: number) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (nextStatus: DeliveryStep) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        throw new Error("This browser does not support GPS location.");
      }

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }),
      ).catch((error: GeolocationPositionError) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. Allow GPS to update delivery status."
            : error.code === error.TIMEOUT
              ? "GPS took too long to respond. Try again."
              : "Your current location is unavailable. Try again.";
        throw new Error(message);
      });

      return advanceDeliveryStatus(orderId, nextStatus, {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider", "activeDelivery"] });
    },
  });

  return {
    advance: (nextStatus: DeliveryStep) => mutation.mutateAsync(nextStatus),
    isAdvancing: mutation.isPending,
  };
}
