// Single source of truth for rider-related shapes — used by the
// repository's return type, the service, the API route, and the
// frontend service. No separate "Api" vs "domain" type: the repository
// already hands back camelCase via queryRows/queryRow.

export interface RiderProfile {
  id: number;
  name: string;
  phone?: string;
  profileImage?: string;
}

export interface DeliveryOpportunity {
  orderId: number;
  restaurantId: number;
  restaurantName: string;
  totalAmount: number;
  createdAt: string;
}

export interface RiderEarningsSummary {
  deliveryDate: string;
  totalDeliveries: number;
  totalIncome: number;
}

export type RiderDutyStatus = "offline" | "idle" | "busy";

export type DeliveryStatus =
  | "accepted"
  | "arrived_at_store"
  | "picked_up"
  | "delivered";
