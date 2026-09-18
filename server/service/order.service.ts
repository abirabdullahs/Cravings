import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";
import {
  createOrder,
  findUserOrders,
  findOrderTrackingForCustomer,
  findOrderDetail,
  findRestaurantOrders,
  markOrderReady,
} from "../repository/order.repository";

const paymentMethods = new Set([
  "card",
  "mobile_banking",
  "bank_transfer",
  "cash",
]);

export const placeOrder = async ({
  userId,
  cartId,
  addressId,
  deliveryFee,
  paymentMethod,
}: {
  userId: string;
  cartId: number;
  addressId: number;
  deliveryFee: number;
  paymentMethod: string;
}) => {
  if (!Number.isInteger(cartId) || !Number.isInteger(addressId)) {
    throw new AppError(
      ErrorCode.INVALID_INPUT,
      "Cart and address are required",
    );
  }
  if (!paymentMethods.has(paymentMethod)) {
    throw new AppError(ErrorCode.INVALID_INPUT, "Payment method is invalid");
  }

  return createOrder({
    userId,
    cartId: String(cartId),
    addressId: String(addressId),
    deliveryFee: Number(deliveryFee) || 0,
    paymentMethod,
  });
};

export const getOrderTrackingForCustomer = async (
  orderId: number,
  customerId: number,
) => await findOrderTrackingForCustomer(orderId, customerId);

export const getUserOrders = (customerId: number) => findUserOrders(customerId);

export const getOrderDetail = (orderId: number, customerId: number) =>
  findOrderDetail(orderId, customerId);

export const getActiveRestaurantOrders = (restaurantId: number) =>
  findRestaurantOrders(restaurantId);

export const setOrderReady = (orderId: number, restaurantId: number) =>
  markOrderReady(orderId, restaurantId);
