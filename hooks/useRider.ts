"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptDeliveryRequest,
  fetchAvailableRequests,
  fetchRiderEarnings,
  fetchRiderProfile,
  setDutyStatus,
} from "@/services/riderService";

export function useRiderProfile() {
  return useQuery({
    queryKey: ["rider", "profile"],
    queryFn: fetchRiderProfile,
  });
}

export function useAvailableRequests() {
  return useQuery({
    queryKey: ["rider", "requests"],
    queryFn: fetchAvailableRequests,
    refetchInterval: 5000, // polling placeholder until realtime replaces it
  });
}

export function useRiderEarnings(date: string) {
  return useQuery({
    queryKey: ["rider", "earnings", date],
    queryFn: () => fetchRiderEarnings(date),
  });
}

// Mutations for the dashboard: accepting a request and toggling duty.
// "Decline" isn't a mutation at all — see rider.service.ts — the caller
// just removes the request from view (e.g. filter it out of the
// useAvailableRequests cache, or let the 5s poll drop it naturally).
export function useRider() {
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: (orderId: number) => acceptDeliveryRequest(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider", "requests"] });
    },
  });

  const dutyMutation = useMutation({
    mutationFn: (status: "online" | "offline") => setDutyStatus(status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider", "profile"] });
    },
  });

  return {
    acceptRequest: (orderId: number) => acceptMutation.mutateAsync(orderId),
    isAccepting: acceptMutation.isPending,
    setDutyStatus: (status: "online" | "offline") => dutyMutation.mutateAsync(status),
    isUpdatingDuty: dutyMutation.isPending,
  };
}
