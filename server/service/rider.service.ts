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
) => {
  switch (status) {
    case "accepted":
      return await acceptRequest(orderId, riderId);

    case "arrived_at_store":
      return await markArrivedAtStore(orderId, riderId);

    case "picked_up":
      return await markPickedUp(orderId, riderId);

    case "delivered":
      return await markDelivered(orderId, riderId);

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

export const getRiderProfile = async (riderId: number) =>
  findRiderProfile(riderId);


export const getActiveDeliveryForRider = async (riderId: number) =>
  await findActiveDeliveryForRider(riderId);