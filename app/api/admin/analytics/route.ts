import { pool } from "@/lib/db";
import { GET_ADMIN_ANALYTICS } from "@/server/query/admin.query";
import { adminApiError, getReportDays, requireAdmin } from "../_lib";

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const range = new URL(request.url).searchParams.get("range");
    const result = await pool.query(GET_ADMIN_ANALYTICS, [getReportDays(range)]);
    const analytics = result.rows[0] ?? {};
    const totalOrders = Number(analytics.total_orders ?? 0);
    return Response.json({
      ...analytics,
      cancellation_rate: totalOrders ? (Number(analytics.cancelled_orders ?? 0) / totalOrders) * 100 : 0,
    });
  } catch (error) {
    return adminApiError(error);
  }
}