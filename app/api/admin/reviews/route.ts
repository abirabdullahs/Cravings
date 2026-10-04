import { pool } from "@/lib/db";
import { GET_ADMIN_REVIEWS } from "@/server/query/admin.query";
import { adminApiError, getPagination, requireAdmin } from "../_lib";

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const params = new URL(request.url).searchParams;
    const rating = Math.min(Math.max(Number(params.get("rating") ?? 0), 0), 5);
    const { page, limit, offset } = getPagination(request, 10);
    const result = await pool.query(GET_ADMIN_REVIEWS, [rating, limit, offset]);
    return Response.json({
      reviews: result.rows,
      page,
      limit,
      total: result.rows[0]?.total_count ?? 0,
    });
  } catch (error) {
    return adminApiError(error);
  }
}
