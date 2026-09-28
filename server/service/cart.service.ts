import {
  findCart,
  findCartItems,
  upsertUserCartItem,
  deleteCartItem,
} from "../repository/cart.repository";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";

export const addCartItem = async ({
  userId,
  restaurantId,
  menuItemId,
  quantity,
}: {
  userId: number;
  restaurantId: number;
  menuItemId: number;
  quantity: number;
}) => {
  if (
    !Number.isInteger(restaurantId) ||
    !Number.isInteger(menuItemId) ||
    !Number.isInteger(quantity) ||
    restaurantId < 1 ||
    menuItemId < 1 ||
    quantity < 0
  ) {
    throw new AppError(
      ErrorCode.INVALID_QUANTITY,
      "Quantity must be zero or a positive whole number",
    );
  }

  if (quantity === 0) {
    const cart = await findCart({ userId, restaurantId });
    if (!cart) return { deleted: true };
    await deleteCartItem({ menuItemId, cartId: cart.id });
    return { deleted: true };
  }

  return upsertUserCartItem({
    userId,
    restaurantId,
    menuItemId,
    quantity,
  });
};

export const getCartItems = async ({
  userId,
  restaurantId,
}: {
  userId: number;
  restaurantId: number | null;
}) => {
  return findCartItems({ userId, restaurantId });
};
