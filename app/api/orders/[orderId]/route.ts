import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";
import {
  cancelCustomerOrder,
  getOrderTrackingForCustomer,
  reorderCustomerOrder,
} from "@/server/service/order.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const user = await getAuthenticatedUser();

    const tracking = await getOrderTrackingForCustomer(
      Number(orderId),
      Number(user.id),
    );

    if (!tracking) {
      // Ownership is enforced inside the WHERE clause (o.user_id = $2), so
      // "not found" also covers "this order isn't yours" — we don't leak
      // which case it was.
      throw new AppError(ErrorCode.NOT_FOUND, "Order not found");
    }

    return NextResponse.json(tracking, { status: 200 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const user = await getAuthenticatedUser();
    const result = await cancelCustomerOrder(Number(orderId), Number(user.id));
    return NextResponse.json(result);
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function POST(
  _: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const user = await getAuthenticatedUser();
    const cart = await reorderCustomerOrder(Number(orderId), Number(user.id));
    return NextResponse.json(cart, { status: 201 });
  } catch (err: unknown) {
    return handleApiError(err, "Unable to add this order to your cart");
  }
}
