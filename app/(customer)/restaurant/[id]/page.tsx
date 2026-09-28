"use client";
import { use } from "react";
import { notFound } from "next/navigation";
import { RestaurantDetailContent } from "@/components/restaurant/restaurant-detail-content";
import { RestaurantDetailHero } from "@/components/restaurant/restaurant-detail-hero";
import { MenuItem } from "@/types/restaurant";
import { useOrder, useCartItems, useRestaurantDetails } from "@/hooks/useOrder";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RestaurantReviews } from "@/components/restaurant/restaurant-reviews";
import { RestaurantDetailSkeleton } from "@/components/restaurant/restaurant-detail-skeleton";

export default function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { status: sessionStatus } = useSession();

  const { createCartItem } = useOrder();
  const { data, isLoading, isError } = useRestaurantDetails(Number(id));
  const { data: cartData } = useCartItems(
    Number(id),
    sessionStatus === "authenticated",
  );
  const cartItems = cartData?.[0]?.cartItems;
  const cartId = cartData?.[0]?.id;

  if (isLoading) {
    return <RestaurantDetailSkeleton />;
  }

  if (isError || !data) {
    notFound();
  }
  const handleAddCartItem = async (item: MenuItem, quantity: number) => {
    if (sessionStatus !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/restaurant/${id}`)}`);
      throw new Error("Please sign in to add items to your cart.");
    }
    await createCartItem({
      menuItemId: item.id,
      restaurantId: Number(data?.restaurant.id),
      quantity,
    });
  };

  return (
    <main className="bg-background">
      <RestaurantDetailHero restaurant={data.restaurant} />
      <RestaurantDetailContent
        key={cartItems
          ?.map((item) => `${item.id}:${item.quantity}`)
          .join("|") ?? "empty-cart"}
        menu={data.menu}
        cartItems={cartItems}
        cartId={cartId}
        restaurantId={data.restaurant.id}
        onAddItem={handleAddCartItem}
      />
      <RestaurantReviews restaurantId={data.restaurant.id} />
    </main>
  );
}
