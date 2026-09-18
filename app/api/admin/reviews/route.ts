import { pool } from "@/lib/db";
import { GET_ADMIN_REVIEWS } from "@/server/query/admin.query";
import { adminApiError, requireAdmin } from "../_lib";

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const params = new URL(request.url).searchParams;
    const rating = Math.min(Math.max(Number(params.get("rating") ?? 0), 0), 5);
    const limit = Math.min(Math.max(Number(params.get("limit") ?? 100), 1), 200);
    const result = await pool.query(GET_ADMIN_REVIEWS, [rating, limit]);
    return Response.json({ reviews: result.rows });
  } catch (error) {
    return adminApiError(error);
  }
}