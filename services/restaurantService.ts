import { apiRequest } from "@/lib/http";
import { getRestaurantDetails } from "@/server/service/restaurant.service";
import type {
  MenuCategory,
  MenuItem,
  MenuItemInput,
  Restaurant,
  RestaurantInput,
  RestaurantMenu,
} from "@/types/restaurant";
import type { RestaurantOrder } from "@/types/order";

export const restaurantService = {
  async list(): Promise<Restaurant[]> {
    return apiRequest<Restaurant[]>("/api/owner/restaurants");
  },

  async create(input: RestaurantInput): Promise<Restaurant> {
    return apiRequest<Restaurant>("/api/owner/restaurants", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(id: number, input: RestaurantInput): Promise<Restaurant> {
    return apiRequest<Restaurant>(`/api/owner/restaurants/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  async remove(id: number): Promise<void> {
    await apiRequest(`/api/owner/restaurants/${id}`, { method: "DELETE" });
  },

  async getMenu(restaurantId: number): Promise<RestaurantMenu> {
    return apiRequest<RestaurantMenu>(
      `/api/owner/restaurants/${restaurantId}/menu`,
    );
  },

  async getOrders(restaurantId: number): Promise<RestaurantOrder[]> {
    return apiRequest<RestaurantOrder[]>(
      `/api/owner/restaurants/${restaurantId}/orders`,
    );
  },

  async markOrderReady(restaurantId: number, orderId: number) {
    return apiRequest<{ id: number; orderStatus: string }>(
      `/api/owner/restaurants/${restaurantId}/orders`,
      {
        method: "PATCH",
        body: JSON.stringify({ orderId, status: "ready" }),
      },
    );
  },

  async createMenuItem(
    restaurantId: number,
    input: MenuItemInput,
  ): Promise<MenuItem> {
    return apiRequest<MenuItem>(`/api/owner/restaurants/${restaurantId}/menu`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async updateMenuItem(
    restaurantId: number,
    itemId: number,
    input: MenuItemInput,
  ): Promise<MenuItem> {
    return apiRequest<MenuItem>(
      `/api/owner/restaurants/${restaurantId}/menu/${itemId}`,
      { method: "PUT", body: JSON.stringify(input) },
    );
  },

  async setMenuItemAvailability(
    restaurantId: number,
    itemId: number,
    isAvailable: boolean,
  ): Promise<MenuItem> {
    return apiRequest<MenuItem>(
      `/api/owner/restaurants/${restaurantId}/menu/${itemId}`,
      { method: "PUT", body: JSON.stringify({ available: isAvailable }) },
    );
  },

  async removeMenuItem(restaurantId: number, itemId: number): Promise<void> {
    await apiRequest(`/api/owner/restaurants/${restaurantId}/menu/${itemId}`, {
      method: "DELETE",
    });
  },

  async createCategory(
    restaurantId: number,
    name: string,
  ): Promise<MenuCategory> {
    return apiRequest<MenuCategory>(
      `/api/owner/restaurants/${restaurantId}/categories`,
      { method: "POST", body: JSON.stringify({ name }) },
    );
  },

  async removeCategory(
    restaurantId: number,
    categoryId: number,
  ): Promise<void> {
    await apiRequest(
      `/api/owner/restaurants/${restaurantId}/categories?categoryId=${categoryId}`,
      { method: "DELETE" },
    );
  },
};
