import { pool } from "@/lib/db";
import { withTransaction } from "@/lib/dblib";
import {
  ACCEPT_REQUEST,
  GET_AVAILABLE_REQUESTS,
  GET_RIDER_EARNINGS_BY_DATE,
  GET_RIDER_PROFILE,
  MARK_DELIVERED,
  MARK_ARRIVED_AT_STORE,
  MARK_PICKED_UP,
  SET_RIDER_STATUS,
  UPDATE_ORDER_STATUS_DELIVERED,
  UPDATE_ORDER_STATUS_OUT_FOR_DELIVERY,
  GET_ACTIVE_DELIVERY_FOR_RIDER,
} from "../query/rider.query";
import { toCamelCase } from "@/lib/case";

export const findAvailableRequests = async () =>
  toCamelCase((await pool.query(GET_AVAILABLE_REQUESTS)).rows);

export const acceptRequest = async (orderId: number, riderId: number) =>
  withTransaction(async (client) => {
    const result = await client.query(ACCEPT_REQUEST, [orderId, riderId]);
    if (result.rowCount !== 1) {
      throw new Error("Delivery is no longer available");
    }

    await client.query(SET_RIDER_STATUS, [riderId, "busy"]);
    return toCamelCase(result.rows[0]);
  });
export const markArrivedAtStore = async (orderId: number, riderId: number) =>
  withTransaction(async (client) => {
    const result = await client.query(MARK_ARRIVED_AT_STORE, [
      orderId,
      riderId,
    ]);

    if (result.rowCount !== 1) {
      throw new Error("Delivery is not in accepted status");
    }

    return toCamelCase(result.rows[0]);
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

    return {
      delivery: toCamelCase(delivery.rows[0]),
      order: toCamelCase(order.rows[0]),
    };
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

    await client.query(SET_RIDER_STATUS, [riderId, "idle"]);
    return {
      delivery: toCamelCase(delivery.rows[0]),
      order: toCamelCase(order.rows[0]),
    };
  });

export const setRiderStatus = async (
  riderId: number,
  status: "offline" | "idle" | "busy",
) => {
  const result = await pool.query(SET_RIDER_STATUS, [riderId, status]);
  console.log(riderId, status);
  if (result.rowCount !== 1) {
    throw new Error("Rider profile not found");
  }

  return toCamelCase(result.rows[0]);
};

export const findRiderEarningsByDate = async (riderId: number, date: string) =>
  toCamelCase(
    (await pool.query(GET_RIDER_EARNINGS_BY_DATE, [riderId, date])).rows[0],
  );

export const findRiderProfile = async (riderId: number) =>
  toCamelCase((await pool.query(GET_RIDER_PROFILE, [riderId])).rows[0]);

export const findActiveDeliveryForRider = async (riderId: number) =>
  toCamelCase(
    (await pool.query(GET_ACTIVE_DELIVERY_FOR_RIDER, [riderId])).rows[0],
  );
