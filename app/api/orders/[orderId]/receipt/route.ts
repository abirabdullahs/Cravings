import { getAuthenticatedUser } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { getOrderReceipt } from "@/server/service/order.service";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const user = await getAuthenticatedUser();
    const { orderId } = await params;
    const parsedOrderId = Number(orderId);

    if (!Number.isInteger(parsedOrderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    return NextResponse.json(
      await getOrderReceipt(parsedOrderId, Number(user.id)),
    );
  } catch (error) {
    return handleApiError(error, "Unable to fetch order receipt");
  }
}
