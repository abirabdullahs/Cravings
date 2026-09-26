import { toCamelCase } from "@/lib/case";
import { pool } from "@/lib/db";
import {
  FIND_AVAILABLE_USER_COUPONS,
  SET_CART_USER_COUPON,
} from "../query/coupon.query";

export async function findAvailableUserCoupons(userId: number) {
  const result = await pool.query(FIND_AVAILABLE_USER_COUPONS, [userId]);
  return toCamelCase(result.rows);
}

export async function setCartUserCoupon({
  cartId,
  userId,
  userCouponId,
}: {
  cartId: number;
  userId: number;
  userCouponId: number | null;
}) {
  const result = await pool.query(SET_CART_USER_COUPON, [
    cartId,
    userId,
    userCouponId,
  ]);
  return result.rows[0] ? toCamelCase(result.rows[0]) : null;
}
