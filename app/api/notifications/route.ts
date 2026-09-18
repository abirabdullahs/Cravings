import { auth } from "@/auth";
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

async function getUserId() {
  const session = await auth();
  return session?.user?.id ? Number(session.user.id) : null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await pool.query(`SELECT id, title, message, order_id, is_read, created_at FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`, [userId]);
  return NextResponse.json({ notifications: result.rows });
}

export async function PATCH(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await request.json();
  const notificationId = Number(payload.notificationId);
  if (!Number.isInteger(notificationId)) return NextResponse.json({ error: "Notification id is required" }, { status: 400 });
  const result = await pool.query(`UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING id, is_read`, [notificationId, userId]);
  if (!result.rows[0]) return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  return NextResponse.json({ notification: result.rows[0] });
}