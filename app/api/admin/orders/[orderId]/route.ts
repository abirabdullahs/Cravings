import { pool } from "@/lib/db";
import { GET_ADMIN_ORDER_DETAILS, GET_ADMIN_ORDER_ITEMS, RELEASE_REQUEUED_RIDER, REQUEUE_ADMIN_ORDER } from "@/server/query/admin.query";
import { adminApiError, requireAdmin } from "../../_lib";
import { cancelOrder } from "@/server/repository/order.repository";
import { AppError } from "@/lib/errors/AppError";

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

export async function PATCH(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  const { orderId } = await params;
  const payload = await request.json();
  const action = payload.action;

  if (action === "cancel") {
    try {
      return Response.json({ order: await cancelOrder(orderId, null) });
    } catch (error) {
      if (error instanceof AppError) {
        return Response.json(error.toJSON(), { status: error.status });
      }
      return adminApiError(error);
    }
  }

  if (action !== "requeue") {
    return Response.json(
      { error: "Admin status overrides are disabled" },
      { status: 405 },
    );
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(REQUEUE_ADMIN_ORDER, [orderId]);
    const delivery = result.rows[0];
    if (!delivery) {
      await client.query("ROLLBACK");
      return Response.json(
        { error: "Only accepted deliveries that have not been picked up can be requeued" },
        { status: 409 },
      );
    }
    await client.query(RELEASE_REQUEUED_RIDER, [delivery.previous_rider_id]);
    await client.query("COMMIT");
    return Response.json({ delivery });
  } catch (error) {
    await client.query("ROLLBACK");
    return adminApiError(error);
  } finally {
    client.release();
  }
}
