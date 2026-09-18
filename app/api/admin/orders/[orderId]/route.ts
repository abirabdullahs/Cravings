import { pool } from "@/lib/db";
import { ASSIGN_ADMIN_ORDER_RIDER, GET_ADMIN_ORDER_DETAILS, GET_ADMIN_ORDER_ITEMS, UPDATE_ADMIN_ORDER_STATUS, UPDATE_ADMIN_PAYMENT_STATUS } from "@/server/query/admin.query";
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

export async function PATCH(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  const { orderId } = await params;
  const payload = await request.json();
  const orderStatus = payload.orderStatus;
  const paymentStatus = payload.paymentStatus;
  const hasRiderUpdate = Object.prototype.hasOwnProperty.call(payload, "riderId");
  const riderId = payload.riderId === null || payload.riderId === "" ? null : Number(payload.riderId);
  const allowedStatuses = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];
  const allowedPaymentStatuses = ["pending", "completed", "failed", "refunded"];
  if (orderStatus !== undefined && !allowedStatuses.includes(orderStatus)) return Response.json({ error: "Invalid order status" }, { status: 400 });
  if (paymentStatus !== undefined && !allowedPaymentStatuses.includes(paymentStatus)) return Response.json({ error: "Invalid payment status" }, { status: 400 });
  if (hasRiderUpdate && riderId !== null && !Number.isInteger(riderId)) return Response.json({ error: "Invalid rider" }, { status: 400 });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let order = null;
    let delivery = null;
    let payment = null;
    if (orderStatus !== undefined) {
      const result = await client.query(UPDATE_ADMIN_ORDER_STATUS, [orderId, orderStatus]);
      order = result.rows[0];
      if (!order) {
        await client.query("ROLLBACK");
        return Response.json({ error: "Order not found" }, { status: 404 });
      }
    }
    if (paymentStatus !== undefined) {
      const result = await client.query(UPDATE_ADMIN_PAYMENT_STATUS, [orderId, paymentStatus]);
      payment = result.rows[0];
      if (!payment) {
        await client.query("ROLLBACK");
        return Response.json({ error: "Payment record not found" }, { status: 404 });
      }
    }
    if (hasRiderUpdate) {
      const riderCheck = riderId === null ? { rowCount: 1 } : await client.query("SELECT 1 FROM riders WHERE user_id = $1", [riderId]);
      if (!riderCheck.rowCount) {
        await client.query("ROLLBACK");
        return Response.json({ error: "Rider not found" }, { status: 404 });
      }
      const result = await client.query(ASSIGN_ADMIN_ORDER_RIDER, [orderId, riderId]);
      delivery = result.rows[0];
      if (!delivery) {
        await client.query("ROLLBACK");
        return Response.json({ error: "Delivery record not found" }, { status: 404 });
      }
    }
    await client.query("COMMIT");
    return Response.json({ order, payment, delivery });
  } catch (error) {
    await client.query("ROLLBACK");
    return adminApiError(error);
  } finally {
    client.release();
  }
}