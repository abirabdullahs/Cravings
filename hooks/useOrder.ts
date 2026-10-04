"use client";
import {
  createCartItem,
  fetchCartItems,
  fetchOrderDetail,
  fetchOrderQuote,
  fetchRestaurantDetails,
  fetchUserCoupons,
  placeOrder,
  submitReview,
  cancelCustomerOrder,
  reorderCustomerOrder,
} from "@/services/orderService";
import type { Cart, CartItemInput, CreateOrderInput, OrderQuote, SubmitReviewInput } from "@/types/order";
import { Restaurant, RestaurantMenu } from "@/types/restaurant";
import { fetchOrderHistory } from "@/services/orderService";
import type { OrderHistoryItem } from "@/types/order";
import { apiRequest } from "@/lib/http";


import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";

// Hook for fetching details
export function useRestaurantDetails(restaurantId: number) {
  return useQuery<{ restaurant: Restaurant; menu: RestaurantMenu }>({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => fetchRestaurantDetails(restaurantId),
    enabled: !!restaurantId, // Prevent query execution if ID is invalid
  });
}
export function useCartItems(restaurantId: number | null, enabled = true) {
  return useQuery<Cart[]>({
    queryKey: ["cart", restaurantId],
    queryFn: () => fetchCartItems(restaurantId),
    enabled,
  });
}

export function useOrderHistory(enabled = true) {
  return useQuery<OrderHistoryItem[]>({
    queryKey: ["orders", "history"],
    queryFn: fetchOrderHistory,
    enabled,
    refetchInterval: (query) =>
      query.state.data?.some(
        (order) => !["delivered", "cancelled"].includes(order.orderStatus),
      )
        ? 15000
        : false,
  });
}

export function useOrderDetail(orderId: number) {
  return useQuery({
    queryKey: ["orders", orderId, "detail"],
    queryFn: () => fetchOrderDetail(orderId),
    enabled: Number.isInteger(orderId),
  });
}

export function useCancelOrder(orderId: number) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => cancelCustomerOrder(orderId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders", orderId] }),
        queryClient.invalidateQueries({ queryKey: ["orders", "history"] }),
      ]);
    },
  });
  return { cancelOrder: mutation.mutateAsync, isCancelling: mutation.isPending };
}

export function useReorder() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (orderId: number) => reorderCustomerOrder(orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return {
    reorder: mutation.mutateAsync,
    isReordering: mutation.isPending,
    reorderingOrderId: mutation.variables ?? null,
  };
}

export function useOrderQuote(
  cartId: number | null,
  addressId: number | null,
) {
  return useQuery<OrderQuote>({
    queryKey: ["order-quote", cartId, addressId],
    queryFn: () => fetchOrderQuote(cartId!, addressId!),
    enabled: cartId !== null && addressId !== null,
  });
}

export function useUserCoupons(){
  return useQuery({
    queryKey: ["user", "coupons"],
    queryFn: fetchUserCoupons,
  })
}


// Hook for cart mutations
export function useOrder() {
  const queryClient = useQueryClient();

  const createCartItemMutation = useMutation({
    mutationFn: (input: CartItemInput) => createCartItem(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cart"] }),
        queryClient.invalidateQueries({ queryKey: ["order-quote"] }),
      ]);
    },
  });
  const placeOrderMutation = useMutation({
    mutationFn: (input: CreateOrderInput) => placeOrder(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cart"] }),
        queryClient.invalidateQueries({ queryKey: ["user", "coupons"] }),
        queryClient.invalidateQueries({ queryKey: ["order-quote"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
      ]);
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: (input: SubmitReviewInput) =>
      submitReview(input),
    onSuccess: async (_, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["reviews"] }),
        queryClient.invalidateQueries({
          queryKey: ["restaurant", input.restaurantId],
        }),
        queryClient.invalidateQueries({ queryKey: ["restaurants"] }),
        queryClient.invalidateQueries({ queryKey: ["orders", "history"] }),
        queryClient.invalidateQueries({
          queryKey: ["orders", input.orderId, "tracking"],
        }),
      ]);
    }
  });

  const addCouponMutation = useMutation({
    mutationFn: ({ userCouponId, cartId }: { userCouponId: number | null; cartId: number }) => {
      return apiRequest("/api/coupons", {
        method: "POST",
        body: JSON.stringify({ userCouponId, cartId }),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user", "coupons"] }),
        queryClient.invalidateQueries({ queryKey: ["order-quote"] }),
      ]);
    }
  });

  return {
    createCartItem: createCartItemMutation.mutateAsync,
    isCreating: createCartItemMutation.isPending,
    placeOrder: (input: CreateOrderInput) =>
      placeOrderMutation.mutateAsync(input),
    isPlacingOrder: placeOrderMutation.isPending,
    submitReview: (input: SubmitReviewInput) =>
      submitReviewMutation.mutateAsync(input),
    isSubmittingReview: submitReviewMutation.isPending,
    addCoupon: (input: { userCouponId: number | null; cartId: number }) =>
      addCouponMutation.mutateAsync(input),
    isAddingCoupon: addCouponMutation.isPending,
  };
}
