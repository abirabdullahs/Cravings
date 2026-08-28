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
  const { data: cartItems } = useCartItems(Number(id));

  if (isLoading) {
    return <div>Loading restaurant details...</div>;
  }

  if (isError || !data) {
    notFound();
  }
  const handleAddCartItem = (item: MenuItem, quantity: number) => {
    createCartItem(item.id, data.restaurant.id, quantity);
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
        onAddItem={handleAddCartItem}
      />
    </main>
  );
}
