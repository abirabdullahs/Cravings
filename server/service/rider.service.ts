import {
  acceptRequest,
  findAvailableRequests,
  findRiderEarningsByDate,
  findRiderProfile,
  markArrivedAtStore,
  markPickedUp,
  markDelivered,
  setRiderStatus,
  findActiveDeliveryForRider,
  findRiderDeliveries,
  markArrivedAtDestination,
} from "../repository/rider.repository";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";

export type DeliveryStatus =
  | "accepted"
  | "arrived_at_store"
  | "picked_up"
  | "delivered";

export const updateDeliveryStatus = async (
  orderId: number,
  riderId: number,
  status: DeliveryStatus | string,
  latitude?: number,
  longitude?: number,
) => {
  const locationRequired = status !== "accepted";
  if (
    locationRequired &&
    (typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180)
  ) {
    throw new AppError(
      ErrorCode.INVALID_INPUT,
      "A valid GPS latitude and longitude are required for this delivery update",
    );
  }

  switch (status) {
    case "accepted":
      return await acceptRequest(orderId, riderId);

    case "arrived_at_store":
      return await markArrivedAtStore(orderId, riderId, latitude!, longitude!);

    case "picked_up":
      return await markPickedUp(orderId, riderId, latitude!, longitude!);

    case "arrived_at_destination":
      return await markArrivedAtDestination(orderId, riderId, latitude!, longitude!);

    case "delivered":
      return await markDelivered(orderId, riderId, latitude!, longitude!);

    default:
      throw new AppError(
        ErrorCode.INVALID_STATUS,
        `Invalid or unsupported status transition: ${status}`,
      );
  }
};

export const getAvailableRequests = async () => findAvailableRequests();

export const updateRiderStatus = async (
  riderId: number,
  status: "offline" | "idle" | "busy",
) => setRiderStatus(riderId, status);

export const getRiderEarningsByDate = async (riderId: number, date: string) =>
  findRiderEarningsByDate(riderId, date);

export const getRiderDeliveries = async (riderId: number, date: string | null) =>
  findRiderDeliveries(riderId, date);

export const getRiderProfile = async (riderId: number) =>
  findRiderProfile(riderId);

export const getActiveDeliveryForRider = async (riderId: number) =>
  await findActiveDeliveryForRider(riderId);
