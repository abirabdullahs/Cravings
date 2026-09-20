import { apiRequest } from "@/lib/http";
import {
  Cart,
  CartItem,
  CartItemInput,
  CreateOrderInput,
  CreatedOrder,
  SubmitReviewInput,
  OrderHistoryItem,
  OrderDetailItem,
  Coupon
} from "@/types/order";
import { Restaurant, RestaurantMenu } from "@/types/restaurant";

export const createCartItem = async (
  input: CartItemInput,
): Promise<CartItem> => {
  return apiRequest<CartItem>(`/api/cart/${input.restaurantId}`, {
    method: "POST",
    body: JSON.stringify(input),
  });
};
export const fetchRestaurantDetails = async (
  restaurantId: number,
): Promise<{ restaurant: Restaurant; menu: RestaurantMenu }> => {
  return apiRequest<{ restaurant: Restaurant; menu: RestaurantMenu }>(
    `/api/restaurants/${restaurantId}`,
  );
};

export const fetchCarts = async (
  retaurantId: Number | null,
): Promise<Cart[]> => {
  return apiRequest<Cart[]>(
    retaurantId === null ? "/api/carts/all" : `/api/carts/${retaurantId}`,
  );
};
export const fetchCartItems = async (
  restaurantId: number | null,
): Promise<Cart[]> => {
  return apiRequest<Cart[]>(
    restaurantId === null ? "/api/cart/all" : `/api/cart/${restaurantId}`,
  );
};

export const fetchUserCoupons = async (): Promise<Coupon[]> => {
  return apiRequest<Coupon[]>("/api/coupons");
};

export const placeOrder = async (
  input: CreateOrderInput,
): Promise<CreatedOrder> =>
  apiRequest<CreatedOrder>("/api/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const submitReview = async (input: SubmitReviewInput) =>
  apiRequest<void>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const fetchOrderHistory = async (): Promise<OrderHistoryItem[]> =>
  apiRequest<OrderHistoryItem[]>("/api/orders");

export const fetchOrderDetail = async (
  orderId: number,
): Promise<OrderDetailItem[]> =>
  apiRequest<OrderDetailItem[]>(`/api/orders/${orderId}/detail`);