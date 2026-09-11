import { requireOwner } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { getOwnerRestaurant } from "@/server/service/restaurant.service";
import {
  getActiveRestaurantOrders,
  setOrderReady,
} from "@/server/service/order.service";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ restaurantId: string }> };

async function getOwnedRestaurantId(userId: string, restaurantId: string) {
  const restaurant = await getOwnerRestaurant(restaurantId, userId);
  return restaurant?.id ?? null;
}

export async function GET(_: Request, { params }: Context) {
  try {
    const user = await requireOwner();
    const { restaurantId } = await params;
    const ownedId = await getOwnedRestaurantId(user.id, restaurantId);

    if (!ownedId)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(await getActiveRestaurantOrders(ownedId));
  } catch (error) {
    return handleApiError(error, "Unable to fetch restaurant orders");
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const user = await requireOwner();
    const { restaurantId } = await params;
    const ownedId = await getOwnedRestaurantId(user.id, restaurantId);
    const { orderId, status } = await request.json();

    if (!ownedId)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (status !== "ready" || !Number.isInteger(Number(orderId))) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 },
      );
    }

    const order = await setOrderReady(Number(orderId), ownedId);
    return order
      ? NextResponse.json(order)
      : NextResponse.json(
          { error: "Order is not ready to update" },
          { status: 409 },
        );
  } catch (error) {
    return handleApiError(error, "Unable to update restaurant order");
  }
}
