import { pool } from "@/lib/db";
import type { PoolClient } from "pg";
import {
  ACCEPT_REQUEST,
  GET_AVAILABLE_REQUESTS,
  GET_RIDER_EARNINGS_BY_DATE,
  GET_RIDER_PROFILE,
  MARK_DELIVERED,
  MARK_PICKED_UP,
  SET_RIDER_STATUS,
  UPDATE_ORDER_STATUS_DELIVERED,
  UPDATE_ORDER_STATUS_OUT_FOR_DELIVERY,
} from "../query/rider.query";

async function withTransaction<T>(work: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export const findAvailableRequests = async () =>
  (await pool.query(GET_AVAILABLE_REQUESTS)).rows;

export const acceptRequest = async (orderId: number, riderId: number) =>
  withTransaction(async (client) => {
    const result = await client.query(ACCEPT_REQUEST, [orderId, riderId]);

    if (result.rowCount !== 1) {
      throw new Error("Delivery is no longer available");
    }

    return result.rows[0];
  });

export const markPickedUp = async (orderId: number, riderId: number) =>
  withTransaction(async (client) => {
    const delivery = await client.query(MARK_PICKED_UP, [orderId, riderId]);

    if (delivery.rowCount !== 1) {
      throw new Error("Delivery is not assigned to this rider");
    }

    const order = await client.query(UPDATE_ORDER_STATUS_OUT_FOR_DELIVERY, [
      orderId,
    ]);

    if (order.rowCount !== 1) {
      throw new Error("Order is not ready for delivery");
    }

    return { delivery: delivery.rows[0], order: order.rows[0] };
  });

export const markDelivered = async (orderId: number, riderId: number) =>
  withTransaction(async (client) => {
    const delivery = await client.query(MARK_DELIVERED, [orderId, riderId]);

    if (delivery.rowCount !== 1) {
      throw new Error("Delivery is not ready to be completed");
    }

    const order = await client.query(UPDATE_ORDER_STATUS_DELIVERED, [orderId]);

    if (order.rowCount !== 1) {
      throw new Error("Order is not out for delivery");
    }

    return { delivery: delivery.rows[0], order: order.rows[0] };
  });

export const setRiderStatus = async (
  riderId: number,
  status: "offline" | "idle" | "busy",
) => {
  const result = await pool.query(SET_RIDER_STATUS, [riderId, status]);

  if (result.rowCount !== 1) {
    throw new Error("Rider profile not found");
  }

  return result.rows[0];
};

export const findRiderEarningsByDate = async (riderId: number, date: string) =>
  (await pool.query(GET_RIDER_EARNINGS_BY_DATE, [riderId, date])).rows[0];

export const findRiderProfile = async (riderId: number) =>
  (await pool.query(GET_RIDER_PROFILE, [riderId])).rows[0];
