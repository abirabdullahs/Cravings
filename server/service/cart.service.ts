import {
  findCart,
  findCartItems,
  insertCart,
  upsertCartItem,
} from "../repository/cart.repository";

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
  let cart = await findCart({ userId, restaurantId });
  if (!cart) {
    cart = await insertCart({ userId, restaurantId });
  }
  const data = await upsertCartItem({ menuItemId, quantity, cartId: cart.id });
  return data;
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
