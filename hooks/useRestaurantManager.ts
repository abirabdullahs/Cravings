import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toErrorMessage } from "@/lib/http";
import { restaurantService } from "@/services/restaurantService";
import { MenuItem, MenuItemInput, RestaurantInput } from "@/types/restaurant";

export function useRestaurantManager({ includeOrders = false } = {}) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const restaurantsQuery = useQuery({
    queryKey: ["owner", "restaurants"],
    queryFn: restaurantService.list,
  });
  const restaurants = restaurantsQuery.data ?? [];
  const selectedRestaurant =
    restaurants.find((restaurant) => restaurant.id === selectedId) ??
    restaurants[0];
  const menuKey = ["owner", "restaurants", selectedRestaurant?.id, "menu"];
  const menuQuery = useQuery({
    queryKey: menuKey,
    queryFn: () => restaurantService.getMenu(selectedRestaurant!.id),
    enabled: Boolean(selectedRestaurant),
  });
  const ordersKey = ["owner", "restaurants", selectedRestaurant?.id, "orders"];
  const ordersQuery = useQuery({
    queryKey: ordersKey,
    queryFn: () => restaurantService.getOrders(selectedRestaurant!.id),
    enabled: includeOrders && Boolean(selectedRestaurant),
    refetchInterval: 10000,
  });
  const readyOrderMutation = useMutation({
    mutationFn: (orderId: number) =>
      restaurantService.markOrderReady(selectedRestaurant!.id, orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ordersKey }),
    onError: (reason) =>
      setError(toErrorMessage(reason, "Could not update order")),
  });

  const invalidateMenu = () =>
    queryClient.invalidateQueries({ queryKey: menuKey });
  const saveRestaurant = useMutation({
    mutationFn: ({
      input,
      id,
    }: {
      input: RestaurantInput;
      id: number | null;
    }) =>
      id
        ? restaurantService.update(id, input)
        : restaurantService.create(input),
    onSuccess: async (restaurant) => {
      await queryClient.invalidateQueries({
        queryKey: ["owner", "restaurants"],
      });
      setSelectedId(restaurant.id);
    },
    onError: (reason) =>
      setError(toErrorMessage(reason, "Could not save restaurant")),
  });
  const deleteRestaurant = useMutation({
    mutationFn: (id: number) => restaurantService.remove(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["owner", "restaurants"] }),
    onError: (reason) =>
      setError(toErrorMessage(reason, "Could not delete restaurant")),
  });
  const saveMenuItem = useMutation({
    mutationFn: ({ input, id }: { input: MenuItemInput; id: number | null }) =>
      id
        ? restaurantService.updateMenuItem(selectedRestaurant!.id, id, input)
        : restaurantService.createMenuItem(selectedRestaurant!.id, input),
    onSuccess: invalidateMenu,
    onError: (reason) =>
      setError(toErrorMessage(reason, "Could not save menu item")),
  });
  const updateAvailability = useMutation({
    mutationFn: (item: MenuItem) =>
      restaurantService.setMenuItemAvailability(
        selectedRestaurant!.id,
        item.id,
        !item.isAvailable,
      ),
    onSuccess: invalidateMenu,
    onError: (reason) =>
      setError(toErrorMessage(reason, "Could not update item")),
  });
  const deleteMenuItem = useMutation({
    mutationFn: (item: MenuItem) =>
      restaurantService.removeMenuItem(selectedRestaurant!.id, item.id),
    onSuccess: invalidateMenu,
    onError: (reason) =>
      setError(toErrorMessage(reason, "Could not delete item")),
  });
  const addCategory = useMutation({
    mutationFn: (name: string) =>
      restaurantService.createCategory(selectedRestaurant!.id, name),
    onSuccess: invalidateMenu,
    onError: (reason) =>
      setError(toErrorMessage(reason, "Could not add category")),
  });
  const deleteCategory = useMutation({
    mutationFn: (categoryId: number) =>
      restaurantService.removeCategory(selectedRestaurant!.id, categoryId),
    onSuccess: invalidateMenu,
    onError: (reason) =>
      setError(toErrorMessage(reason, "Could not delete category")),
  });
  const busy = [
    saveRestaurant,
    deleteRestaurant,
    saveMenuItem,
    updateAvailability,
    deleteMenuItem,
    addCategory,
    deleteCategory,
  ].some((mutation) => mutation.isPending);

  return {
    restaurants,
    selectedRestaurant,
    categories: menuQuery.data?.categories ?? [],
    items: menuQuery.data?.items ?? [],
    orders: ordersQuery.data ?? [],
    markOrderReady: (orderId: number) =>
      readyOrderMutation.mutateAsync(orderId),
    error:
      error ||
      (restaurantsQuery.error
        ? toErrorMessage(restaurantsQuery.error, "Could not load restaurants")
        : menuQuery.error
          ? toErrorMessage(menuQuery.error, "Could not load menu")
          : ordersQuery.error
            ? toErrorMessage(ordersQuery.error, "Could not load orders")
            : ""),
    busy,
    setSelectedId,
    setError,
    saveRestaurant: (input: RestaurantInput, id: number | null) =>
      saveRestaurant.mutateAsync({ input, id }),
    deleteRestaurant: () =>
      selectedRestaurant && deleteRestaurant.mutateAsync(selectedRestaurant.id),
    saveMenuItem: async (input: MenuItemInput, id: number | null) => {
      if (selectedRestaurant) await saveMenuItem.mutateAsync({ input, id });
    },
    toggleMenuItemAvailability: (item: MenuItem) =>
      selectedRestaurant && updateAvailability.mutateAsync(item),
    deleteMenuItem: (item: MenuItem) =>
      selectedRestaurant && deleteMenuItem.mutateAsync(item),
    addCategory: async (name: string) => {
      if (selectedRestaurant) await addCategory.mutateAsync(name);
    },
    deleteCategory: (categoryId: number) =>
      selectedRestaurant && deleteCategory.mutateAsync(categoryId),
  };
}

// export { emptyRestaurantInput, emptyMenuItemInput };
