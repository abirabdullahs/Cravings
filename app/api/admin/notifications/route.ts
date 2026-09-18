import { pool } from "@/lib/db";
import { adminApiError, requireAdmin } from "../_lib";

export async function POST(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const payload = await request.json();
    const title = typeof payload.title === "string" ? payload.title.trim() : "";
    const message = typeof payload.message === "string" ? payload.message.trim() : "";
    const audience = payload.audience === "specific" ? "specific" : "all";
    const userIds = Array.isArray(payload.userIds) ? payload.userIds.map(Number).filter(Number.isInteger) : [];

    if (!title || !message) return Response.json({ error: "Title and message are required" }, { status: 400 });
    if (audience === "specific" && !userIds.length) return Response.json({ error: "Select at least one customer" }, { status: 400 });

    const result = audience === "all"
      ? await pool.query(`INSERT INTO notifications (user_id, title, message) SELECT id, $1, $2 FROM users WHERE role = 'customer' RETURNING id`, [title, message])
      : await pool.query(`INSERT INTO notifications (user_id, title, message) SELECT id, $1, $2 FROM users WHERE role = 'customer' AND id = ANY($3::int[]) RETURNING id`, [title, message, userIds]);

    return Response.json({ sentCount: result.rowCount ?? 0 }, { status: 201 });
  } catch (error) {
    return adminApiError(error);
  }
}