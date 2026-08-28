import { apiError, requireOwner } from "@/lib/auth-helper";
import {
  addCategory,
  removeCategory,
} from "@/server/service/restaurant.service";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ restaurantId: string }> };

export async function POST(request: Request, { params }: Context) {
  const access = await requireOwner();
  if (access.response) return access.response;
  try {
    const { restaurantId } = await params;
    const { name } = await request.json();
    const data = await addCategory(restaurantId, access.user.id, name);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const access = await requireOwner();
  if (access.response) return access.response;
  try {
    const { restaurantId } = await params;
    const categoryId = new URL(request.url).searchParams.get("categoryId");
    if (!categoryId)
      return NextResponse.json(
        { error: "category id required" },
        { status: 400 },
      );
    await removeCategory(categoryId, restaurantId, access.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
