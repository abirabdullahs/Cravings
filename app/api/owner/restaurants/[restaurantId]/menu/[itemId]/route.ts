import { requireOwner } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import {
  removeMenuItem,
  setMenuAvailability,
  modifyMenuItem,
} from "@/server/service/restaurant.service";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ restaurantId: string; itemId: string }> };

export async function PUT(request: Request, { params }: Context) {
  const user = await requireOwner();
  try {
    const { restaurantId, itemId } = await params;
    const body = await request.json();
    if (typeof body.available === "boolean") {
      return NextResponse.json(
        await setMenuAvailability(
          itemId,
          restaurantId,
          user.id,
          body.available,
        ),
      );
    }
    const item = await modifyMenuItem(itemId, restaurantId, user.id, body);
    return item
      ? NextResponse.json(item, { status: 200 })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return handleApiError(error, "Unable to update menu item");
  }
}

export async function DELETE(_: Request, { params }: Context) {
  const user = await requireOwner();
  try {
    const { restaurantId, itemId } = await params;
    const count = await removeMenuItem(itemId, restaurantId, user.id);
    return count
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return handleApiError(error, "Unable to delete menu item");
  }
}
