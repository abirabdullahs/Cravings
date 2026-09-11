import { apiRequest } from "@/lib/http";
import type {
  DeliveryStep,
  DeliveryTracking,
  TrackingItem,
} from "@/types/delivery-tracking";

export const fetchActiveDelivery = async (): Promise<DeliveryTracking | null> =>
  apiRequest<DeliveryTracking | null>("/api/rider/deliveries/active");

export const fetchOrderTracking = async (
  orderId: number,
): Promise<DeliveryTracking> =>
  apiRequest<DeliveryTracking>(`/api/orders/${orderId}`);

export const fetchOrderReceipt = async (
  orderId: number,
): Promise<TrackingItem[]> =>
  apiRequest<TrackingItem[]>(`/api/orders/${orderId}/receipt`);

export const advanceDeliveryStatus = async (
  orderId: number,
  status: DeliveryStep,
): Promise<void> => {
  await apiRequest(`/api/rider/deliveries/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};
