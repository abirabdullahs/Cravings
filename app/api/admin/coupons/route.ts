import { auth } from "@/auth";
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || String(session.user.role ?? "").toLowerCase() !== "admin") return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const [coupons, users] = await Promise.all([
    pool.query(`SELECT c.id, c.code, c.discount_type, c.discount_value, c.minimum_order, c.expiry_date, COUNT(uc.id)::int AS assigned_count FROM coupons c LEFT JOIN user_coupons uc ON uc.coupon_id = c.id GROUP BY c.id ORDER BY c.id DESC`),
    pool.query(`SELECT id, name, email FROM users WHERE role = 'customer' ORDER BY name, email`),
  ]);
  return NextResponse.json({ coupons: coupons.rows, users: users.rows });
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const payload = await request.json();
  const code = typeof payload.code === "string" ? payload.code.trim().toUpperCase() : "";
  const discountType = payload.discountType === "percentage" || payload.discountType === "fixed_amount" ? payload.discountType : "";
  const discountValue = Number(payload.discountValue);
  const minimumOrder = Number(payload.minimumOrder ?? 0);
  const expiryDate = typeof payload.expiryDate === "string" && payload.expiryDate ? payload.expiryDate : null;
  const assignMode = payload.assignMode === "specific" ? "specific" : "all";
  const userIds = Array.isArray(payload.userIds) ? payload.userIds.map(Number).filter(Number.isInteger) : [];
  if (!code || !discountType || !Number.isFinite(discountValue) || discountValue <= 0 || !Number.isFinite(minimumOrder) || minimumOrder < 0 || (discountType === "percentage" && discountValue > 100)) return NextResponse.json({ error: "Enter valid coupon details" }, { status: 400 });
  if (assignMode === "specific" && userIds.length === 0) return NextResponse.json({ error: "Select at least one customer" }, { status: 400 });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const coupon = await client.query(`INSERT INTO coupons (code, discount_type, discount_value, minimum_order, expiry_date) VALUES ($1, $2, $3, $4, $5) RETURNING id, code, discount_type, discount_value, minimum_order, expiry_date`, [code, discountType, discountValue, minimumOrder, expiryDate]);
    if (assignMode === "all") {
      await client.query(`INSERT INTO user_coupons (user_id, coupon_id) SELECT id, $1 FROM users WHERE role = 'customer'`, [coupon.rows[0].id]);
    } else {
      await client.query(`INSERT INTO user_coupons (user_id, coupon_id) SELECT id, $1 FROM users WHERE role = 'customer' AND id = ANY($2::int[]) AND NOT EXISTS (SELECT 1 FROM user_coupons WHERE user_id = users.id AND coupon_id = $1)`, [coupon.rows[0].id, userIds]);
    }
    await client.query("COMMIT");
    return NextResponse.json({ coupon: coupon.rows[0] }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    const message = error instanceof Error && error.message.includes("uq_coupons_code") ? "Coupon code already exists" : "Could not create coupon";
    return NextResponse.json({ error: message }, { status: 400 });
  } finally {
    client.release();
  }
}