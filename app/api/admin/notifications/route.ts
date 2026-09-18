import { pool } from "@/lib/db";
import { adminApiError, requireAdmin } from "../_lib";
import { createNotification } from "@/server/service/notification.service";

export async function POST(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const payload = await request.json();
    const title = typeof payload.title === "string" ? payload.title.trim() : "";
    const message =
      typeof payload.message === "string" ? payload.message.trim() : "";
    const audience = payload.audience === "specific" ? "specific" : "all";
    const userIds = Array.isArray(payload.userIds)
      ? payload.userIds.map(Number).filter(Number.isInteger)
      : [];

    if (!title || !message)
      return Response.json(
        { error: "Title and message are required" },
        { status: 400 },
      );
    if (audience === "specific" && !userIds.length)
      return Response.json(
        { error: "Select at least one customer" },
        { status: 400 },
      );

    const users =
      audience === "all"
        ? await pool.query(`SELECT id FROM users WHERE role = 'customer'`)
        : await pool.query(
            `SELECT id FROM users WHERE role = 'customer' AND id = ANY($1::int[])`,
            [userIds],
          );
    await Promise.all(
      users.rows.map((user) =>
        createNotification(Number(user.id), null, title, message),
      ),
    );

    return Response.json({ sentCount: users.rows.length }, { status: 201 });
  } catch (error) {
    return adminApiError(error);
  }
}
