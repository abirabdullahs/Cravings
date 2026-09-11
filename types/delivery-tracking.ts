// One shape, two viewers. Rider-only and customer-only fields are optional
// rather than split into separate types — the two pages render almost the
// same data, and forcing them into different types would just mean mapping
// between them for no benefit.

export type DeliveryStep =
  | "unassigned"
  | "accepted"
  | "arrived_at_store"
  | "picked_up"
  | "delivered";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface TrackingItem {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export const DELIVERY_STEPS: { key: DeliveryStep; label: string }[] = [
  { key: "accepted", label: "Order Accepted" },
  { key: "arrived_at_store", label: "Heading to Restaurant" },
  { key: "picked_up", label: "Picked Up Food" },
  { key: "delivered", label: "Delivered to Customer" },
];

export interface DeliveryTracking {
  orderId: number;
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

  totalAmount: number;
  paymentMethod: string | null;
  itemCount: number;
}
