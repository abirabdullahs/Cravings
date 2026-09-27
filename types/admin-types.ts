export type Restaurant = {
  id: number;
  name: string;
  address: string;
  owner_name: string;
  owner_phone: string | null;
  active_status: boolean;
  product_count: string;
  order_count: string;
};
export type Rider = {
  id: number;
  name: string;
  phone: string | null;
  vehicle_type: string;
  vehicle_number: string;
  status: "offline" | "idle" | "busy";
};
export type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
  order_count: number;
  coupon_count: number;
  role_request_count: number;
};
export type ReviewRequest = {
  id: number;
  user_id: number;
  requested_role: string;
  status: string;
  details: string | null;
  verification_data?: Record<string, unknown>;
  rejection_reason?: string | null;
  requester_name?: string;
  requester_email?: string;
  requester_phone?: string | null;
};
export type AdminOrder = {
  id: number;
  total_amount: string;
  order_status: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  restaurant_name: string;
  payment_status: string | null;
  delivery_status: string | null;
};
export type Coupon = {
  id: number;
  code: string;
  discount_type: string;
  discount_value: string;
  minimum_order: string;
  expiry_date: string | null;
  assigned_count: number;
};
export type Customer = { id: number; name: string; email: string };
export type AdminReview = {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  customer_name: string;
  customer_email: string;
  restaurant_name: string;
  order_id: number;
};
