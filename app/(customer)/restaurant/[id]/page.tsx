"use client";
import { use } from "react";
import { notFound } from "next/navigation";
import { RestaurantDetailContent } from "@/components/restaurant/restaurant-detail-content";
import { RestaurantDetailHero } from "@/components/restaurant/restaurant-detail-hero";
import { MenuItem } from "@/types/restaurant";
import { useOrder, useCartItems, useRestaurantDetails } from "@/hooks/useOrder";

export default function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { createCartItem } = useOrder();
  const { data, isLoading, isError } = useRestaurantDetails(Number(id));
  const { data: cartData } = useCartItems(Number(id));
  const cartItems = cartData?.[0]?.cartItems;
  const cartId = cartData?.[0]?.id;

  if (isLoading) {
    return <div>Loading restaurant details...</div>;
  }

  if (isError || !data) {
    notFound();
  }
  const handleAddCartItem = (item: MenuItem, quantity: number) => {
    createCartItem({menuItemId: item.id, restaurantId: Number(data.restaurant.id), quantity});
  };

  return (
    <main className="bg-background">
      <RestaurantDetailHero restaurant={data.restaurant} />
      <RestaurantDetailContent
        key={
          cartItems
            ?.map((item) => `${item.menuItemId}:${item.quantity}`)
            .join("|") ?? "loading"
        }
        menu={data.menu}
        cartItems={cartItems}
        cartId={cartId}
        restaurantId={data.restaurant.id}
        onAddItem={handleAddCartItem}
      />
    </main>
  );
}
