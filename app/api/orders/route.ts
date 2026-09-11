import { getAuthenticatedUser } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { placeOrder } from "@/server/service/order.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const input = await request.json();
    const order = await placeOrder({ userId: user.id, ...input });
    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error, "Unable to place order");
  }
}

