import { getAuthenticatedUser } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { getUserOrders, placeOrder } from "@/server/service/order.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const input = await request.json();
    const order = await placeOrder({
      userId: user.id,
      cartId: input.cartId,
      addressId: input.addressId,
      paymentMethod: input.paymentMethod,
      idempotencyKey: input.idempotencyKey,
      deliveryInstructions: input.deliveryInstructions,
    });
    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error, "Unable to place order");
  }
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    return NextResponse.json(await getUserOrders(Number(user.id)));
  } catch (error: unknown) {
    return handleApiError(error, "Unable to fetch order history");
  }
}
