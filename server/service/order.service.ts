import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";
import {
  createOrder,
  findUserOrders,
  findOrderTrackingForCustomer,
  findOrderDetail,
  findRestaurantOrders,
  markOrderReady,
  findOrderQuote,
} from "../repository/order.repository";

const paymentMethods = new Set([
  "cash",
  "bkash",
  "nagad",
  "card",
]);

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const placeOrder = async ({
  userId,
  cartId,
  addressId,
  paymentMethod,
  idempotencyKey,
  deliveryInstructions,
}: {
  userId: string;
  cartId: number;
  addressId: number;
  paymentMethod: string;
  idempotencyKey: string;
  deliveryInstructions: unknown;
}) => {
  if (
    !Number.isInteger(cartId) ||
    cartId < 1 ||
    !Number.isInteger(addressId) ||
    addressId < 1
  ) {
    throw new AppError(
      ErrorCode.INVALID_INPUT,
      "Cart and address are required",
    );
  }
  if (!paymentMethods.has(paymentMethod)) {
    throw new AppError(ErrorCode.INVALID_INPUT, "Payment method is invalid");
  }
  if (typeof idempotencyKey !== "string" || !uuidPattern.test(idempotencyKey)) {
    throw new AppError(ErrorCode.INVALID_INPUT, "Checkout identifier is invalid");
  }
  if (typeof deliveryInstructions !== "string") {
    throw new AppError(ErrorCode.INVALID_INPUT, "Delivery instructions are invalid");
  }

  return createOrder({
    userId,
    cartId: String(cartId),
    addressId: String(addressId),
    paymentMethod,
    idempotencyKey,
    deliveryInstructions,
  });
};

export const getOrderQuote = async ({
  userId,
  cartId,
  addressId,
}: {
  userId: string;
  cartId: number;
  addressId: number;
}) => {
  if (!Number.isInteger(cartId) || !Number.isInteger(addressId)) {
    throw new AppError(
      ErrorCode.INVALID_INPUT,
      "Cart and address are required",
    );
  }

  const quote = await findOrderQuote(Number(userId), cartId, addressId);
  if (!quote) {
    throw new AppError(
      ErrorCode.CART_NOT_FOUND,
      "Cart or delivery address not found",
    );
  }

  return quote;
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
