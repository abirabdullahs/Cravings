import { apiRequest } from "@/lib/http";
import type { RestaurantSummary } from "@/types/restaurant";

export interface RestaurantFilter {
  search?: string;
  cuisine?: string;
  area?: string;
  sort?: "top-rated" | "fastest" | "cheapest" | "popular";
  limit?: number;
}

function toQueryString(filter: RestaurantFilter): string {
  const params = new URLSearchParams();
  if (filter.search) params.set("search", filter.search);
  if (filter.cuisine) params.set("cuisine", filter.cuisine);
  if (filter.area) params.set("area", filter.area);
  if (filter.sort) params.set("sort", filter.sort);
  if (filter.limit) params.set("limit", String(filter.limit));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const fetchRestaurants = async (
  filter: RestaurantFilter = {},
): Promise<RestaurantSummary[]> =>
  apiRequest<RestaurantSummary[]>(`/api/restaurants${toQueryString(filter)}`);
