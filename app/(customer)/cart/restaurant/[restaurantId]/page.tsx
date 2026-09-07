"use client";

import { use } from "react";
import { CheckoutPage } from "../../[cartId]/page";

export default function RestaurantCheckoutRoute({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = use(params);
  const numericRestaurantId = Number(restaurantId);

  if (!Number.isInteger(numericRestaurantId) || numericRestaurantId < 1) {
    return (
      <p className="p-8 text-center text-sm text-muted-foreground">
        Restaurant cart not found.
      </p>
    );
  }

  return <CheckoutPage restaurantId={numericRestaurantId} />;
}
