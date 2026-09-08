import { pool } from "@/lib/db";
import { GET_ALL_RESTAURANTS_WITH_OWNER } from "@/server/query/admin.query";
import { adminApiError, requireAdmin } from "../_lib";

export async function GET() {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const result = await pool.query(GET_ALL_RESTAURANTS_WITH_OWNER);
    return Response.json({ restaurants: result.rows });
  } catch (error) {
    return adminApiError(error);
  }
}