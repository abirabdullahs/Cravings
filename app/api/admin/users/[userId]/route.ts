import { pool } from "@/lib/db";
import { GET_ADMIN_USER_DETAILS } from "@/server/query/admin.query";
import { adminApiError, requireAdmin } from "../../_lib";

export async function GET(_: Request, { params }: { params: Promise<{ userId: string }> }) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const { userId } = await params;
    const result = await pool.query(GET_ADMIN_USER_DETAILS, [userId]);
    if (!result.rows[0]) return Response.json({ error: "User not found" }, { status: 404 });
    return Response.json({ user: result.rows[0] });
  } catch (error) {
    return adminApiError(error);
  }
}