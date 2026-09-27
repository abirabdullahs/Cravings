import { getAuthenticatedUser } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import {
  chooseCartCoupon,
  getAvailableUserCoupons,
} from "@/server/service/coupon.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    return NextResponse.json(
      await getAvailableUserCoupons(Number(user.id)),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    const { userCouponId, cartId } = await request.json();
    const cart = await chooseCartCoupon({
      userId: Number(user.id),
      cartId: Number(cartId),
      userCouponId: userCouponId === null ? null : Number(userCouponId),
    });
    return NextResponse.json({ cart });
  } catch (error) {
    return handleApiError(error);
  }
}
