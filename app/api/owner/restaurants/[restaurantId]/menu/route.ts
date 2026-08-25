import { apiError, requireOwner } from "@/lib/auth-helper";
import {
  addMenuItem,
  getRestaurantMenu,
} from "@/app/server/service/restaurant.service";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ restaurantId: string }> };

export async function GET(_: Request, { params }: Context) {
  const access = await requireOwner();
  if (access.response) return access.response;
  try {
    const { restaurantId } = await params;
    const menu = await getRestaurantMenu(restaurantId, access.user.id);
    return menu
      ? NextResponse.json({ categories: menu[0], items: menu[1] })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request, { params }: Context) {
  const access = await requireOwner();
  if (access.response) return access.response;
  try {
    const { restaurantId } = await params;
    return NextResponse.json(
      await addMenuItem(restaurantId, access.user.id, await request.json()),
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}
