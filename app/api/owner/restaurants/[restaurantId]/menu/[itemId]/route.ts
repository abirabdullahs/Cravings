import { apiError, requireOwner } from "@/lib/auth-helper";
import {
  removeMenuItem,
  setMenuAvailability,
  modifyMenuItem,
} from "@/server/service/restaurant.service";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ restaurantId: string; itemId: string }> };

export async function PUT(request: Request, { params }: Context) {
  const access = await requireOwner();
  if (access.response) return access.response;
  try {
    const { restaurantId, itemId } = await params;
    const body = await request.json();
    if (typeof body.available === "boolean") {
      return NextResponse.json(
        await setMenuAvailability(
          itemId,
          restaurantId,
          access.user.id,
          body.available,
        ),
      );
    }
    const item = await modifyMenuItem(
      itemId,
      restaurantId,
      access.user.id,
      body,
    );
    return item
      ? NextResponse.json(item)
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_: Request, { params }: Context) {
  const access = await requireOwner();
  if (access.response) return access.response;
  try {
    const { restaurantId, itemId } = await params;
    const count = await removeMenuItem(itemId, restaurantId, access.user.id);
    return count
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return apiError(error);
  }
}
