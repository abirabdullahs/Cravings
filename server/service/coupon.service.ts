import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";
import {
  findAvailableUserCoupons,
  setCartUserCoupon,
} from "../repository/coupon.repository";

export function getAvailableUserCoupons(userId: number) {
  return findAvailableUserCoupons(userId);
}

export async function chooseCartCoupon({
  cartId,
  userId,
  userCouponId,
}: {
  cartId: number;
  userId: number;
  userCouponId: number | null;
}) {
  if (
    !Number.isInteger(cartId) ||
    cartId < 1 ||
    (userCouponId !== null &&
      (!Number.isInteger(userCouponId) || userCouponId < 1))
  ) {
    throw new AppError(ErrorCode.INVALID_INPUT, "Invalid cart or coupon");
  }

  const cart = await setCartUserCoupon({ cartId, userId, userCouponId });
  if (!cart) {
    throw new AppError(
      ErrorCode.INVALID_INPUT,
      "Coupon is expired, used, unavailable, or does not belong to you",
    );
  }
  return cart;
}
