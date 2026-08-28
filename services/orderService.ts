import { apiRequest } from "@/lib/http";
import { CartItem, CartItemInput } from "@/types/order";
import { Restaurant, RestaurantMenu } from "@/types/restaurant";

export const create = async (input: CartItemInput): Promise<CartItem> => {
    return apiRequest<CartItem>(`/api/cart/${input.restaurantId}`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }
export const fetchRestaurantDetails = async (
    restaurantId: number,
  ): Promise<{ restaurant: Restaurant; menu: RestaurantMenu }> => {
    return apiRequest<{ restaurant: Restaurant; menu: RestaurantMenu }>(
      `/api/restaurants/${restaurantId}`,
    );
  }

export const fetchCartItems = async (
  restaurantId: number|null
): Promise<CartItem[]> => {
  return apiRequest<CartItem[]>(`/api/cart/${restaurantId}`);
}