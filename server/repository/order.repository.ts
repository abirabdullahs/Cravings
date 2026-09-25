import { pool } from "@/lib/db";
import { withTransaction } from "@/lib/dblib";
import { toCamelCase } from "@/lib/case";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";
import {
  CALL_CREATE_ORDER_PROCEDURE,
  CANCEL_DELIVERY_ON_ORDER_CANCEL,
  CANCEL_ORDER,
  GET_USER_ORDERS,
  GET_RESTAURANT_ORDERS,
  FIND_ORDER_DETAIL,
  GET_ORDER_TRACKING_FOR_CUSTOMER,
  MARK_ORDER_READY,
  GET_ORDER_QUOTE,
} from "../query/order.query";

export const createOrder = async ({
  userId,
  cartId,
  addressId,
  paymentMethod,
  idempotencyKey,
  deliveryInstructions,
}: {
  userId: string;
  cartId: string;
  addressId: string;
  paymentMethod: string;
  idempotencyKey: string;
  deliveryInstructions: string;
}) => {
  try {
    const result = await pool.query(CALL_CREATE_ORDER_PROCEDURE, [
      userId,
      cartId,
      addressId,
      paymentMethod,
      idempotencyKey,
      deliveryInstructions,
    ]);

    const orderId = result.rows[0]?.p_order_id;
    if (!orderId) {
      throw new Error("Order was created without an order ID");
    }

    return { id: Number(orderId) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Cart not found") {
      throw new AppError(ErrorCode.CART_NOT_FOUND, message);
    }
    if (
      message === "Restaurant is not accepting orders" ||
      message === "Delivery address not found" ||
      message === "Cart is empty" ||
      message === "Cart contains unavailable items" ||
      message === "Coupon is no longer valid" ||
      message.startsWith("Minimum order amount is")
    ) {
      throw new AppError(ErrorCode.INVALID_INPUT, message);
    }
    throw error;
  }
};

export const findOrderQuote = async (
  userId: number,
  cartId: number,
  addressId: number,
) => {
  const row = (await pool.query(GET_ORDER_QUOTE, [userId, cartId, addressId]))
    .rows[0];

  if (!row) return null;

  return {
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    deliveryFee: Number(row.delivery_fee),
    tax: Number(row.tax),
    finalTotal: Number(row.final_total),
  };
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

export const findOrderDetail = async (orderId: number, customerId: number) => {
  const result = await pool.query(FIND_ORDER_DETAIL, [orderId, customerId]);

  if (result.rowCount === 0) {
    throw new Error("Order not found");
  }

  const first = result.rows[0];
  return {
    orderId: Number(first.order_id),
    items: result.rows
      .filter((row) => row.item_id !== null)
      .map((row) => ({
        id: Number(row.item_id),
        name: row.item_name,
        quantity: Number(row.quantity),
        unitPrice: Number(row.unit_price),
        subtotal: Number(row.item_subtotal),
      })),
    subtotal: Number(first.subtotal),
    discount: Number(first.discount),
    deliveryFee: Number(first.delivery_fee),
    tax: Number(first.tax),
    totalAmount: Number(first.total_amount),
    paidAt: first.paid_at,
    transactionId: first.transaction_id,
    deliveryInstructions: first.delivery_instructions,
  };
};

export const findOrderTrackingForCustomer = async (
  orderId: number,
  customerId: number,
) =>
  toCamelCase(
    (await pool.query(GET_ORDER_TRACKING_FOR_CUSTOMER, [orderId, customerId]))
      .rows[0],
  );
