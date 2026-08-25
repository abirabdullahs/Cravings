import { getAuthenticatedUser } from "@/lib/auth-helper";
import { addCartItem, getCartItems } from "@/app/server/service/cart.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { restaurantId, menuItemId, quantity } = await request.json();
    const { user, errorResponse } = await getAuthenticatedUser();
    if (errorResponse) return errorResponse;
    const data = addCartItem({
      userId: user.id,
      restaurantId,
      menuItemId,
      quantity,
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unable to update cart";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, errorResponse } = await getAuthenticatedUser();
    if (errorResponse) return errorResponse;

    const searchParams = request.nextUrl.searchParams;
    const restaurantId = searchParams.get("restaurantId");
    const data = await getCartItems({ userId: user.id, restaurantId });
    return NextResponse.json(data, { status: 200 });
  } catch {}
}
