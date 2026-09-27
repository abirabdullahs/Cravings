import { apiRequest } from "@/lib/http";
import type {
  DeliveryItem,
  DeliveryOpportunity,
  RiderDutyStatus,
  RiderEarningsSummary,
  RiderProfile,
} from "@/types/rider";

export const fetchAvailableRequests = async (): Promise<
  DeliveryOpportunity[]
> => apiRequest<DeliveryOpportunity[]>("/api/rider/requests");

export const fetchRiderProfile = async (): Promise<RiderProfile> =>
  apiRequest<RiderProfile>("/api/rider/profile");

export const fetchRiderEarnings = async (
  date: string,
): Promise<RiderEarningsSummary> =>
  apiRequest<RiderEarningsSummary>(`/api/rider/earnings?date=${date}`);

export const acceptDeliveryRequest = async (orderId: number): Promise<void> => {
  await apiRequest(`/api/rider/deliveries/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "accepted" }),
  });
};

export const setDutyStatus = async (
  status: Extract<RiderDutyStatus, "offline"> | "online",
): Promise<void> => {
  await apiRequest("/api/rider", {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

export const fetchDeliveries = async (riderId: number, date: string | null): Promise<DeliveryItem[]> =>{
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  return await apiRequest<DeliveryItem[]>(`/api/rider/deliveries?${params.toString()}`);
}