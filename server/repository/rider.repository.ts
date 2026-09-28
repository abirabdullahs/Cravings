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
  SETTLE_CASH_PAYMENT,
  UPDATE_ORDER_STATUS_OUT_FOR_DELIVERY,
  GET_ACTIVE_DELIVERY_FOR_RIDER,
  INSERT_DELIVERY_LOCATION,
  LOCK_RIDER_FOR_ACCEPT,
  GET_RIDER_DELIVERIES,
  HAS_ACTIVE_DELIVERY,
  SET_RIDER_DUTY_STATUS,
  MARK_ARRIVED_AT_DESTINATION,
  CANCEL_RIDER_ASSIGNMENT,
} from "../query/rider.query";
import { INSERT_ORDER_NOTIFICATION } from "../query/notification.query";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";
import { toCamelCase } from "@/lib/case";

export const findAvailableRequests = async () => {
  return toCamelCase((await pool.query(GET_AVAILABLE_REQUESTS)).rows);
};

export const acceptRequest = async (
  orderId: number,
  riderId: number,
  latitude: number,
  longitude: number,
) =>
  withTransaction(async (client) => {
    const rider = await client.query(LOCK_RIDER_FOR_ACCEPT, [riderId]);
    if (rider.rowCount !== 1) {
      throw new AppError(ErrorCode.RIDER_NOT_FOUND);
    }
    const active = await client.query(HAS_ACTIVE_DELIVERY, [riderId]);
    if (active.rows[0]?.has_active) {
      throw new AppError(
        ErrorCode.STATUS_CONFLICT,
        "You already have an active delivery",
      );
    }
    if (rider.rows[0].status !== "idle") {
      throw new AppError(
        ErrorCode.STATUS_CONFLICT,
        "You must be available before accepting a delivery",
      );
    }

    const result = await client.query(ACCEPT_REQUEST, [orderId, riderId]);
    if (result.rowCount !== 1) {
      throw new AppError(
        ErrorCode.STATUS_CONFLICT,
        "Delivery is no longer available",
      );
    }

    await client.query(INSERT_DELIVERY_LOCATION, [
      result.rows[0].id,
      latitude,
      longitude,
      "accepted",
    ]);
    await client.query(SET_RIDER_STATUS, [riderId, "busy"]);
    await client.query(INSERT_ORDER_NOTIFICATION, [
      orderId,
      "Rider assigned",
      "A rider accepted your delivery and is heading to the restaurant.",
    ]);
    return toCamelCase(result.rows[0]);
  });
export const markArrivedAtStore = async (
  orderId: number,
  riderId: number,
  latitude: number,
  longitude: number,
) =>
  withTransaction(async (client) => {
    const result = await client.query(MARK_ARRIVED_AT_STORE, [
      orderId,
      riderId,
    ]);

    if (result.rowCount !== 1) {
      throw new AppError(
        ErrorCode.STATUS_CONFLICT,
        "Delivery is no longer in accepted status",
      );
    }

    await client.query(INSERT_DELIVERY_LOCATION, [
      result.rows[0].id,
      latitude,
      longitude,
      "arrived_at_store",
    ]);

    return toCamelCase(result.rows[0]);
  });

export const cancelRiderAssignment = async (
  orderId: number,
  riderId: number,
) =>
  withTransaction(async (client) => {
    const result = await client.query(CANCEL_RIDER_ASSIGNMENT, [
      orderId,
      riderId,
    ]);
    if (result.rowCount !== 1) {
      throw new AppError(
        ErrorCode.STATUS_CONFLICT,
        "A delivery cannot be cancelled after pickup",
      );
    }
    await client.query(SET_RIDER_STATUS, [riderId, "idle"]);
    await client.query(INSERT_ORDER_NOTIFICATION, [
      orderId,
      "Finding another rider",
      "The previous rider cancelled the assignment. We are finding another rider.",
    ]);
    return toCamelCase(result.rows[0]);
  });
export const markPickedUp = async (
  orderId: number,
  riderId: number,
  latitude: number,
  longitude: number,
) =>
  withTransaction(async (client) => {
    const delivery = await client.query(MARK_PICKED_UP, [orderId, riderId]);

    if (delivery.rowCount !== 1) {
      throw new AppError(
        ErrorCode.STATUS_CONFLICT,
        "Delivery must be at the restaurant before pickup",
      );
    }

    const order = await client.query(UPDATE_ORDER_STATUS_OUT_FOR_DELIVERY, [
      orderId,
    ]);

    if (order.rowCount !== 1) {
      throw new AppError(
        ErrorCode.STATUS_CONFLICT,
        "The restaurant has not marked this order ready",
      );
    }

    await client.query(INSERT_DELIVERY_LOCATION, [
      delivery.rows[0].id,
      latitude,
      longitude,
      "picked_up",
    ]);

    await client.query(INSERT_ORDER_NOTIFICATION, [
      orderId,
      "Order picked up",
      "Your order is on the way.",
    ]);

    return {
      delivery: toCamelCase(delivery.rows[0]),
      order: toCamelCase(order.rows[0]),
    };
  });

export const markArrivedAtDestination = async (
  orderId: number,
  riderId: number,
  latitude: number,
  longitude: number,
) =>
  withTransaction(async (client) => {
    const result = await client.query(MARK_ARRIVED_AT_DESTINATION, [
      orderId,
      riderId,
    ]);

    if (result.rowCount !== 1) {
      throw new AppError(
        ErrorCode.STATUS_CONFLICT,
        "Only a picked-up delivery can arrive at the destination",
      );
    }

    await client.query(INSERT_DELIVERY_LOCATION, [
      result.rows[0].id,
      latitude,
      longitude,
      "arrived_at_destination",
    ]);

    await client.query(INSERT_ORDER_NOTIFICATION, [
      orderId,
      "Rider has arrived",
      "Your rider has arrived at the delivery destination.",
    ]);

    return toCamelCase(result.rows[0]);
  });

export const markDelivered = async (
  orderId: number,
  riderId: number,
  latitude: number,
  longitude: number,
) =>
  withTransaction(async (client) => {
    const delivery = await client.query(MARK_DELIVERED, [orderId, riderId]);

    if (delivery.rowCount !== 1) {
      throw new AppError(
        ErrorCode.STATUS_CONFLICT,
        "The rider must arrive at the destination before completing delivery",
      );
    }

    const order = await client.query(UPDATE_ORDER_STATUS_DELIVERED, [orderId]);

    if (order.rowCount !== 1) {
      throw new AppError(
        ErrorCode.STATUS_CONFLICT,
        "Order is not out for delivery",
      );
    }

    const payment = await client.query(SETTLE_CASH_PAYMENT, [orderId]);

    await client.query(INSERT_DELIVERY_LOCATION, [
      delivery.rows[0].id,
      latitude,
      longitude,
      "delivered",
    ]);

    await client.query(SET_RIDER_STATUS, [riderId, "idle"]);
    await client.query(INSERT_ORDER_NOTIFICATION, [
      orderId,
      "Order delivered",
      "Your order has been delivered. Enjoy your meal!",
    ]);
    return {
      delivery: toCamelCase(delivery.rows[0]),
      order: toCamelCase(order.rows[0]),
      payment: payment.rows[0] ? toCamelCase(payment.rows[0]) : null,
    };
  });

export const setRiderStatus = async (
  riderId: number,
  status: "offline" | "idle",
) => {
  const result = await pool.query(SET_RIDER_DUTY_STATUS, [riderId, status]);
  if (result.rowCount !== 1) {
    throw new AppError(
      ErrorCode.STATUS_CONFLICT,
      "A rider with an active delivery cannot change duty status",
    );
  }

  return toCamelCase(result.rows[0]);
};

export const findRiderEarningsByDate = async (riderId: number, date: string) =>
  toCamelCase(
    (await pool.query(GET_RIDER_EARNINGS_BY_DATE, [riderId, date])).rows[0],
  );

export const findRiderDeliveries = async (riderId: number, date: string | null) =>
  toCamelCase(
    (await pool.query(GET_RIDER_DELIVERIES, [riderId, date])).rows,
  );
export const findRiderProfile = async (riderId: number) =>
  toCamelCase((await pool.query(GET_RIDER_PROFILE, [riderId])).rows[0]);

export const findActiveDeliveryForRider = async (riderId: number) => {
  return toCamelCase(
    (await pool.query(GET_ACTIVE_DELIVERY_FOR_RIDER, [riderId])).rows[0],
  );
};
