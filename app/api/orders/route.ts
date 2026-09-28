import { getAuthenticatedUser } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { stripBodyUserOverride } from "@/server/service/auth.service";
import { getUserOrders, placeOrder } from "@/server/service/order.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const input = stripBodyUserOverride(
      (await request.json()) as {
        userId?: string;
        cartId: unknown;
        addressId: unknown;
        paymentMethod: unknown;
        idempotencyKey: unknown;
        deliveryInstructions: unknown;
      },
      user.id,
    );
    const order = await placeOrder({
      userId: user.id,
      cartId: Number(input.cartId),
      addressId: Number(input.addressId),
      paymentMethod: String(input.paymentMethod ?? ""),
      idempotencyKey: String(input.idempotencyKey ?? ""),
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
