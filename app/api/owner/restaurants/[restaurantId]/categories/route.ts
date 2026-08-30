import { requireOwner } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import {
  addCategory,
  removeCategory,
} from "@/server/service/restaurant.service";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ restaurantId: string }> };

export async function POST(request: Request, { params }: Context) {
  const user = await requireOwner();
  try {
    const { restaurantId } = await params;
    const { name } = await request.json();
    const data = await addCategory(restaurantId, user.id, name);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    handleApiError(error, "Unable to add category");
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const user = await requireOwner();
  try {
    const { restaurantId } = await params;
    const categoryId = new URL(request.url).searchParams.get("categoryId");
    if (!categoryId)
      return NextResponse.json(
        { error: "category id required" },
        { status: 400 },
      );
    await removeCategory(categoryId, restaurantId, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    handleApiError(error, "Unable to remove category");
  }
}
