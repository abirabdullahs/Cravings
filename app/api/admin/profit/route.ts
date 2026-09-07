import { pool } from "@/lib/db";
import { GET_PLATFORM_TOTALS, GET_RESTAURANT_WISE_PROFIT, GET_WEEKLY_PLATFORM_PROFIT } from "@/server/query/admin.query";
import { adminApiError, getPlatformFee, getReportDays, requireAdmin } from "../_lib";

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const days = getReportDays(new URL(request.url).searchParams.get("range"));
    const fee = getPlatformFee();
    const [totals, weekly, restaurants] = await Promise.all([
      pool.query(GET_PLATFORM_TOTALS, [fee, days]),
      pool.query(GET_WEEKLY_PLATFORM_PROFIT, [fee, days]),
      pool.query(GET_RESTAURANT_WISE_PROFIT, [fee, days]),
    ]);
    return Response.json({ days, platformFee: fee, totals: totals.rows[0], weekly: weekly.rows, restaurants: restaurants.rows });
  } catch (error) {
    return adminApiError(error);
  }
}