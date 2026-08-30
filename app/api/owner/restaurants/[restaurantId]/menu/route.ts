import { requireOwner } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import {
  addMenuItem,
  getRestaurantMenu,
} from "@/server/service/restaurant.service";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ restaurantId: string }> };

export async function GET(_: Request, { params }: Context) {
  try {
    const user = await requireOwner();

    const { restaurantId } = await params;
    const menu = await getRestaurantMenu(restaurantId, user.id);
    return NextResponse.json(menu);
  } catch (error) {
    handleApiError(error, "Unable to fetch menu");
  }
}

export async function POST(request: Request, { params }: Context) {
  const user = await requireOwner();
  try {
    const { restaurantId } = await params;
    return NextResponse.json(
      await addMenuItem(restaurantId, user.id, await request.json()),
      { status: 201 },
    );
  } catch (error) {
    handleApiError(error, "Unable to add menu item");
  }
}
