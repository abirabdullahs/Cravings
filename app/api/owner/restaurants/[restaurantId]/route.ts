import { requireOwner } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import {
  getOwnerRestaurant,
  modifyRestaurant,
  removeRestaurant,
  unarchiveRestaurant,
} from "@/server/service/restaurant.service";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ restaurantId: string }> };

export async function GET(_: Request, { params }: Context) {
  try {
    const user = await requireOwner();
    const { restaurantId } = await params;
    const restaurant = await getOwnerRestaurant(restaurantId, user.id);
    return restaurant
      ? NextResponse.json(restaurant)
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return handleApiError(error, "Unable to fetch restaurant");
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const user = await requireOwner();
    const { restaurantId } = await params;
    const restaurant = await modifyRestaurant(
      restaurantId,
      user.id,
      await request.json(),
    );
    return restaurant
      ? NextResponse.json(restaurant)
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return handleApiError(error, "Unable to update restaurant");
  }
}

export async function DELETE(_: Request, { params }: Context) {
  try {
    const user = await requireOwner();
    const { restaurantId } = await params;
    const count = await removeRestaurant(restaurantId, user.id);
    return count
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return handleApiError(error, "Unable to archive restaurant");
  }
}

export async function PATCH(_: Request, { params }: Context) {
  try {
    const user = await requireOwner();
    const { restaurantId } = await params;
    const count = await unarchiveRestaurant(restaurantId, user.id);
    return count
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return handleApiError(error, "Unable to restore restaurant");
  }
}
