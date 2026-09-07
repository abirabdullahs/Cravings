import { getAuthenticatedUser } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { getCartItems } from "@/server/service/cart.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    const data = await getCartItems({ userId: Number(user.id), restaurantId: null });
    return NextResponse.json(data);
  } catch (error: unknown) {
    return handleApiError(error, "Unable to fetch cart");
  }
}