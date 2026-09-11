"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  advanceDeliveryStatus,
  fetchActiveDelivery,
  fetchOrderReceipt,
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
    refetchInterval: 10000,
    enabled: Number.isInteger(orderId),
  });
}

export function useOrderReceipt(orderId: number) {
  return useQuery({
    queryKey: ["orders", orderId, "receipt"],
    queryFn: () => fetchOrderReceipt(orderId),
    enabled: Number.isInteger(orderId),
  });
}

export function useAdvanceDelivery(orderId: number) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (nextStatus: DeliveryStep) =>
      advanceDeliveryStatus(orderId, nextStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider", "activeDelivery"] });
    },
  });

  return {
    advance: (nextStatus: DeliveryStep) => mutation.mutateAsync(nextStatus),
    isAdvancing: mutation.isPending,
  };
}
