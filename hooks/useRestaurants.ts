"use client";
import { useQuery } from "@tanstack/react-query";
import {
  fetchRestaurants,
  type RestaurantFilter,
} from "@/services/restaurantCatalogService";

export function useRestaurants(filter: RestaurantFilter) {
  return useQuery({
    queryKey: ["restaurants", filter],
    queryFn: () => fetchRestaurants(filter),
  });
}

export function usePopularRestaurants(limit = 4) {
  return useRestaurants({ sort: "popular", limit });
}
