import { pool } from "@/lib/db";
import { GET_ADMIN_ORDERS } from "@/server/query/admin.query";
import { adminApiError, requireAdmin } from "../_lib";

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const params = new URL(request.url).searchParams;
    const orderStatus = params.get("orderStatus") ?? "";
    const paymentStatus = params.get("paymentStatus") ?? "";
    const deliveryStatus = params.get("deliveryStatus") ?? "";
    const page = Math.max(Number(params.get("page") ?? 1), 1);
    const limit = Math.min(Math.max(Number(params.get("limit") ?? 50), 1), 100);
    const result = await pool.query(GET_ADMIN_ORDERS, [orderStatus, paymentStatus, deliveryStatus, limit, (page - 1) * limit]);
    return Response.json({ orders: result.rows, page, limit });
  } catch (error) {
    return adminApiError(error);
  }
}