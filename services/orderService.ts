import { apiRequest } from "@/lib/http";
import {
  Cart,
  CartItem,
  CartItemInput,
  CreateOrderInput,
  CreatedOrder,
  UserAddress,
} from "@/types/order";
import { Restaurant, RestaurantMenu } from "@/types/restaurant";

export const createCartItem = async (input: CartItemInput): Promise<CartItem> => {
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

export const fetchCartItems = async (
  restaurantId: number | null,
): Promise<Cart[]> => {
  return apiRequest<Cart[]>(
    restaurantId === null ? "/api/cart/all" : `/api/cart/${restaurantId}`,
  );
};

// export const fetchAddresses = async (): Promise<UserAddress[]> =>
//   apiRequest<UserAddress[]>("/api/addresses");

export const placeOrder = async (
  input: CreateOrderInput,
): Promise<CreatedOrder> =>
  apiRequest<CreatedOrder>("/api/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
