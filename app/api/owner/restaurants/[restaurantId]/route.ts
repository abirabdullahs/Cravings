import { apiError, requireOwner } from "@/lib/auth-helper";
import {
  getOwnerRestaurant,
  modifyRestaurant,
  removeRestaurant,
} from "@/app/server/service/restaurant.service";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ restaurantId: string }> };

export async function GET(_: Request, { params }: Context) {
  const access = await requireOwner();
  if (access.response) return access.response;
  try {
    const { restaurantId } = await params;
    const restaurant = await getOwnerRestaurant(restaurantId, access.user.id);
    return restaurant
      ? NextResponse.json(restaurant)
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request, { params }: Context) {
  const access = await requireOwner();
  if (access.response) return access.response;
  try {
    const { restaurantId } = await params;
    const restaurant = await modifyRestaurant(
      restaurantId,
      access.user.id,
      await request.json(),
    );
    return restaurant
      ? NextResponse.json(restaurant)
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_: Request, { params }: Context) {
  const access = await requireOwner();
  if (access.response) return access.response;
  try {
    const { restaurantId } = await params;
    const count = await removeRestaurant(restaurantId, access.user.id);
    return count
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return apiError(error);
  }
}
