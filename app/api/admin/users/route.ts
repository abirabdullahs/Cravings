import { pool } from "@/lib/db";
import { GET_ADMIN_USERS } from "@/server/query/admin.query";
import { adminApiError, requireAdmin } from "../_lib";

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const params = new URL(request.url).searchParams;
    const role = params.get("role") ?? "";
    const search = (params.get("search") ?? "").trim();
    const page = Math.max(Number(params.get("page") ?? 1), 1);
    const limit = Math.min(Math.max(Number(params.get("limit") ?? 50), 1), 100);
    const result = await pool.query(GET_ADMIN_USERS, [role, search, limit, (page - 1) * limit]);
    return Response.json({ users: result.rows, page, limit });
  } catch (error) {
    return adminApiError(error);
  }
}