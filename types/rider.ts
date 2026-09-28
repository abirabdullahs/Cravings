// Single source of truth for rider-related shapes — used by the
// repository's return type, the service, the API route, and the
// frontend service. No separate "Api" vs "domain" type: the repository
// already hands back camelCase via queryRows/queryRow.

export interface RiderProfile {
  id: number;
  name: string;
  phone?: string;
  profileImage?: string;
  status: string;
}

export interface DeliveryOpportunity {
  orderId: number;
  restaurantId: number;
  restaurantName: string;
  totalAmount: number;
  deliveryFee: number;
  pickupDistanceKm: number;
  deliveryDistanceKm: number;
  createdAt: string;
}
export interface DeliveryItem {
  deliveryId: number;
  orderId: number;
  deliveryStatus: string;
  orderStatus: string;
  totalAmount: number;
  deliveryFee: number;
  restaurantName: string;
  restaurantAddress: string;
  dropoffAddress: string;
  assignedAt: string;
  deliveredAt: string | null;
}
export interface RiderEarningsSummary {
  deliveryDate: string;
  totalDeliveries: number;
  totalIncome: number;
}

export interface RiderReview {
  id: number;
  orderId: number;
  rating: number;
  comment: string | null;
  customerName: string;
  restaurantName: string;
  createdAt: string;
}

export type RiderDutyStatus = "offline" | "idle" | "busy";

export type DeliveryStatus =
  | "accepted"
  | "arrived_at_store"
  | "picked_up"
  | "delivered";
