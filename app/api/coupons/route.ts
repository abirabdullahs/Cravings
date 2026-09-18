import { auth } from "@/auth";
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await pool.query(`SELECT uc.id, c.code, c.discount_type, c.discount_value, c.minimum_order, c.expiry_date, uc.used FROM user_coupons uc JOIN coupons c ON c.id = uc.coupon_id WHERE uc.user_id = $1 AND uc.used = FALSE AND (c.expiry_date IS NULL OR c.expiry_date >= CURRENT_DATE) ORDER BY c.expiry_date NULLS LAST, c.id DESC`, [Number(session.user.id)]);
  return NextResponse.json({ coupons: result.rows });
}