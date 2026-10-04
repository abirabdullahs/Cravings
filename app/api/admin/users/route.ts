import { pool } from "@/lib/db";
import { GET_ADMIN_USERS } from "@/server/query/admin.query";
import { adminApiError, getPagination, requireAdmin } from "../_lib";

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const params = new URL(request.url).searchParams;
    const role = params.get("role") ?? "";
    const search = (params.get("search") ?? "").trim();
    const { page, limit, offset } = getPagination(request, 12);
    const result = await pool.query(GET_ADMIN_USERS, [role, search, limit, offset]);
    return Response.json({ users: result.rows, page, limit, total: result.rows[0]?.total_count ?? 0 });
  } catch (error) {
    return adminApiError(error);
  }
}
