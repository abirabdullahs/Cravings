import { getAuthenticatedUser } from "@/lib/auth-helper";
import { toCamelCase } from "@/lib/case";
import { pool } from "@/lib/db";
import { handleApiError } from "@/lib/errors/handleApiError";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    const result = await pool.query(
      `SELECT uc.id, c.code, c.discount_type, c.discount_value, c.minimum_order, c.expiry_date, uc.used FROM user_coupons uc JOIN coupons c ON c.id = uc.coupon_id WHERE uc.user_id = $1 AND uc.used = FALSE AND (c.expiry_date IS NULL OR c.expiry_date >= CURRENT_DATE) ORDER BY c.expiry_date NULLS LAST, c.id DESC`,
      [Number(user.id)],
    );
    const data = toCamelCase(result.rows);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try{
    const user = await getAuthenticatedUser();
    const { couponId, cartId } = await request.json();
    const result = await pool.query(
      `UPDATE carts SET coupon_id = $1 WHERE cart_id = $2 RETURNING *`,
      [Number(couponId), Number(cartId)]
    );
    return NextResponse.json({ userCoupon: result.rows[0] }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}