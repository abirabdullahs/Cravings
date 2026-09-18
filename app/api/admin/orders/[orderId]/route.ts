import { pool } from "@/lib/db";
import { GET_ADMIN_ORDER_DETAILS, GET_ADMIN_ORDER_ITEMS } from "@/server/query/admin.query";
import { adminApiError, requireAdmin } from "../../_lib";

export async function GET(_: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const { orderId } = await params;
    const [order, items] = await Promise.all([
      pool.query(GET_ADMIN_ORDER_DETAILS, [orderId]),
      pool.query(GET_ADMIN_ORDER_ITEMS, [orderId]),
    ]);
    if (!order.rows[0]) return Response.json({ error: "Order not found" }, { status: 404 });
    return Response.json({ order: order.rows[0], items: items.rows });
  } catch (error) {
    return adminApiError(error);
  }
}