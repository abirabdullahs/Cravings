"use client";
import {
  createCartItem,
  fetchCartItems,
  fetchRestaurantDetails,
  placeOrder,
} from "@/services/orderService";
import type { Cart, CartItemInput, CreateOrderInput } from "@/types/order";
import { Restaurant, RestaurantMenu } from "@/types/restaurant";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";

// Hook for fetching details
export function useRestaurantDetails(restaurantId: number) {
  return useQuery<{ restaurant: Restaurant; menu: RestaurantMenu }>({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => fetchRestaurantDetails(restaurantId),
    enabled: !!restaurantId, // Prevent query execution if ID is invalid
  });
}
export function useCartItems(restaurantId: number | null) {
  return useQuery<Cart[]>({
    queryKey: ["cart", restaurantId],
    queryFn: () => fetchCartItems(restaurantId),
  });
}

// Hook for cart mutations
export function useOrder() {
  const queryClient = useQueryClient();

  const createCartItemMutation = useMutation({
    mutationFn: (input: CartItemInput) => createCartItem(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
  const placeOrderMutation = useMutation({
    mutationFn: (input: CreateOrderInput) => placeOrder(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return {
    createCartItem: (
      menuItemId: number,
      restaurantId: number,
      quantity: number,
    ) =>
      createCartItemMutation.mutateAsync({
        menuItemId,
        restaurantId,
        quantity,
      }),
    isCreating: createCartItemMutation.isPending,
    placeOrder: (input: CreateOrderInput) =>
      placeOrderMutation.mutateAsync(input),
    isPlacingOrder: placeOrderMutation.isPending,
  };
}
