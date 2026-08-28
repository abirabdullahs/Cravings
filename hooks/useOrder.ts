"use client"
import { create, fetchCartItems, fetchRestaurantDetails } from "@/services/orderService";
import { CartItemInput } from "@/types/order";
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
  return useQuery({
    queryKey: ["cart", restaurantId],
    queryFn: () => fetchCartItems( restaurantId ),
    enabled: !!restaurantId,
  });
}
// Hook for cart mutations
export function useOrder() {
  const queryClient = useQueryClient();

  const createCartItemMutation = useMutation({
    mutationFn: (input: CartItemInput) => create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
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
  };
}
