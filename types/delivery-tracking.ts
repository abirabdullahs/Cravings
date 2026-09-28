// One shape, two viewers. Rider-only and customer-only fields are optional
// rather than split into separate types — the two pages render almost the
// same data, and forcing them into different types would just mean mapping
// between them for no benefit.

export type DeliveryStep =
  | "unassigned"
  | "accepted"
  | "arrived_at_store"
  | "picked_up"
  | "arrived_at_destination"
  | "delivered"
  | "cancelled";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";



export const DELIVERY_STEPS: { key: DeliveryStep; label: string }[] = [
  { key: "accepted", label: "Heading to restaurant" },
  { key: "arrived_at_store", label: "Arrived at restaurant" },
  { key: "picked_up", label: "Picked up and on the way" },
  { key: "arrived_at_destination", label: "Arrived at destination" },
  { key: "delivered", label: "Delivered to customer" },
];

export interface DeliveryTracking {
  orderId: number;
  restaurantId: number;
  orderStatus: OrderStatus;
  deliveryStatus: DeliveryStep;
  assignedAt: string | null;

  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string | null;

  dropoffAddress: string;
  customerName?: string; // present for the rider view
  customerPhone?: string; // present for the rider view

  riderName?: string; // present for the customer view
  riderPhone?: string; // present for the customer view
  riderId?: number | null;

  totalAmount: number;
  paymentMethod: string | null;
  itemCount: number;
  isReviewed?: boolean; // customer tracking response only
  restaurantLatitude: number | null;
  restaurantLongitude: number | null;
  dropoffLatitude: number | null;
  dropoffLongitude: number | null;
  riderLatitude: number | null;
  riderLongitude: number | null;
  riderLocationRecordedAt: string | null;
  distanceKm: number | null;
}
