import { getAuthenticatedUser } from "@/lib/auth-helper";
import { addCartItem, getCartItems } from "@/server/service/cart.service";
import { NextRequest, NextResponse } from "next/server";

type Context = { params: Promise<{ restaurantId: string }> };

export async function POST(request: NextRequest, context: Context) {
  try {
    const { menuItemId, quantity } = await request.json();
    const { restaurantId } = await context.params;
    const { user, errorResponse } = await getAuthenticatedUser();
    if (errorResponse) return errorResponse;

    // require validation
    const data = await addCartItem({
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

export async function GET(request: NextRequest, context: Context) {
  try {
    const { user, errorResponse } = await getAuthenticatedUser();
    if (errorResponse) return errorResponse;

    const { restaurantId } = await context.params;
    const data = await getCartItems({
      userId: Number(user.id),
      restaurantId: Number(restaurantId),
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch cart";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
