"use client";
import {
  createCartItem,
  fetchCartItems,
  fetchOrderDetail,
  fetchRestaurantDetails,
  placeOrder,
  submitReview,
} from "@/services/orderService";
import type { Cart, CartItemInput, CreateOrderInput, SubmitReviewInput } from "@/types/order";
import { Restaurant, RestaurantMenu } from "@/types/restaurant";
import { fetchOrderHistory } from "@/services/orderService";
import type { OrderHistoryItem } from "@/types/order";


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

export function useOrderHistory() {
  return useQuery<OrderHistoryItem[]>({
    queryKey: ["orders", "history"],
    queryFn: fetchOrderHistory,
  });
}

export function useOrderDetail(orderId: number) {
  return useQuery({
    queryKey: ["orders", orderId, "detail"],
    queryFn: () => fetchOrderDetail(orderId),
    enabled: Number.isInteger(orderId),
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

  const submitReviewMutation = useMutation({
    mutationFn: (input: SubmitReviewInput) =>
      submitReview(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reviews"] });
    }
  });

  return {
    createCartItem: ( input: CartItemInput ) =>
      createCartItemMutation.mutateAsync(input),
    isCreating: createCartItemMutation.isPending,
    placeOrder: (input: CreateOrderInput) =>
      placeOrderMutation.mutateAsync(input),
    isPlacingOrder: placeOrderMutation.isPending,
    submitReview: (input: SubmitReviewInput) =>
      submitReviewMutation.mutateAsync(input),
    isSubmittingReview: submitReviewMutation.isPending,
  };
}
