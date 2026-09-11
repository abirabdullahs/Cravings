import { apiRequest } from "@/lib/http";
import type {
  DeliveryOpportunity,
  RiderDutyStatus,
  RiderEarningsSummary,
  RiderProfile,
} from "@/types/rider";

export const fetchAvailableRequests = async (): Promise<DeliveryOpportunity[]> =>
  apiRequest<DeliveryOpportunity[]>("/api/rider/requests");

export const fetchRiderProfile = async (): Promise<RiderProfile> =>
  apiRequest<RiderProfile>("/api/rider/profile");

export const fetchRiderEarnings = async (date: string): Promise<RiderEarningsSummary> =>
  apiRequest<RiderEarningsSummary>(`/api/rider/earnings?date=${date}`);

export const acceptDeliveryRequest = async (orderId: number): Promise<void> => {
  await apiRequest(`/api/rider/deliveries/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "accepted" }),
  });
};

export const setDutyStatus = async (status: Extract<RiderDutyStatus, "offline"> | "online"): Promise<void> => {
  await apiRequest("/api/rider", {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};
