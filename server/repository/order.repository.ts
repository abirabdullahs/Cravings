import { pool } from "@/lib/db";
import { withTransaction } from "@/lib/dblib";
import { toCamelCase } from "@/lib/case";
import {
  CALL_CREATE_ORDER_PROCEDURE,
  CANCEL_DELIVERY_ON_ORDER_CANCEL,
  CANCEL_ORDER,
  GET_USER_ORDERS,
  GET_RESTAURANT_ORDERS,
  FIND_ORDER_DETAIL,
  GET_ORDER_TRACKING_FOR_CUSTOMER,
  GET_ORDER_RECEIPT,
  MARK_ORDER_READY,
} from "../query/order.query";

export const createOrder = async ({
  userId,
  cartId,
  addressId,
  deliveryFee,
  paymentMethod,
}: {
  userId: string;
  cartId: string;
  addressId: string;
  deliveryFee: number;
  paymentMethod: string;
}) => {
  const result = await pool.query(CALL_CREATE_ORDER_PROCEDURE, [
    userId,
    cartId,
    addressId,
    deliveryFee,
    paymentMethod,
  ]);

  const orderId = result.rows[0]?.p_order_id;
  if (!orderId) {
    throw new Error("Order was created without an order ID");
  }

  return { id: Number(orderId) };
};

export const cancelOrder = async (orderId: string) =>
  withTransaction(async (client) => {
    const orderResult = await client.query(CANCEL_ORDER, [orderId]);

    if (orderResult.rowCount !== 1) {
      throw new Error("Order not found or cannot be cancelled");
    }

    await client.query(CANCEL_DELIVERY_ON_ORDER_CANCEL, [orderId]);

    return toCamelCase(orderResult.rows[0]);
  });

export const findUserOrders = async (userId: number) => {
  const rows = (await pool.query(GET_USER_ORDERS, [userId])).rows;
  return toCamelCase(rows);
};

export const findRestaurantOrders = async (restaurantId: number) => {
  const rows = (await pool.query(GET_RESTAURANT_ORDERS, [restaurantId])).rows;
  return toCamelCase(rows);
};

export const markOrderReady = async (orderId: number, restaurantId: number) => {
  const result = await pool.query(MARK_ORDER_READY, [orderId, restaurantId]);
  return result.rows[0] ? toCamelCase(result.rows[0]) : null;
};

export const findOrderDetail = async (orderId: number) => {
  const result = await pool.query(FIND_ORDER_DETAIL, [orderId]);

  if (result.rowCount === 0) {
    throw new Error("Order not found");
  }

  return toCamelCase(result.rows);
};

export const findOrderTrackingForCustomer = async (
  orderId: number,
  customerId: number,
) =>
  toCamelCase(
    (await pool.query(GET_ORDER_TRACKING_FOR_CUSTOMER, [orderId, customerId]))
      .rows[0],
  );

export const findOrderReceipt = async (orderId: number, customerId: number) =>
  toCamelCase(
    (await pool.query(GET_ORDER_RECEIPT, [orderId, customerId])).rows,
  );
