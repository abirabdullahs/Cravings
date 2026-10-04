import { pool } from "@/lib/db";
import { GET_ALL_RIDERS } from "@/server/query/admin.query";
import { adminApiError, getPagination, requireAdmin } from "../_lib";

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const { page, limit, offset } = getPagination(request);
    const result = await pool.query(GET_ALL_RIDERS, [limit, offset]);
    return Response.json({
      riders: result.rows,
      page,
      limit,
      total: result.rows[0]?.total_count ?? 0,
    });
  } catch (error) {
    return adminApiError(error);
  }
}
