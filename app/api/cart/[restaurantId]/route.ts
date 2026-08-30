import { getAuthenticatedUser } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { addCartItem, getCartItems } from "@/server/service/cart.service";
import { NextRequest, NextResponse } from "next/server";

type Context = { params: Promise<{ restaurantId: string }> };

export async function POST(request: NextRequest, context: Context) {
  try {
    const { menuItemId, quantity } = await request.json();
    const { restaurantId } = await context.params;
    const user = await getAuthenticatedUser();

    // require validation
    const data = await addCartItem({
      userId: user.id,
      restaurantId,
      menuItemId,
      quantity,
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    handleApiError(error, "Unable to update cart");
  }
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const user = await getAuthenticatedUser();

    const { restaurantId } = await context.params;
    const data = await getCartItems({
      userId: Number(user.id),
      restaurantId: Number(restaurantId),
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    handleApiError(error, "Unable to fetch cart");
  }
}
