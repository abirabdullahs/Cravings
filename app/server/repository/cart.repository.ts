import { pool } from "@/app/lib/db";
export const findCart = async ({userId, restaurantId}: {
  userId: string;
  restaurantId: string;
}) => {
  const data = await pool.query(FIND_CART, [userId, restaurantId]);
  return data.rows[0];
};

export const insertCart = async ({userId, restaurantId}:{
  userId: string; restaurantId: string;
}) => {
  const data = await pool.query(INSERT_CART, [userId, restaurantId]);
  return data.rows[0];
}

export const upsertCartItem = async ({menuItemId, quantity, cartId}:{
  menuItemId: string; quantity: number; cartId: string}) => {
    const data = await pool.query(UPSERT_CART_ITEM, [menuItemId, quantity, cartId]);
    return data.rows[0];
  }

export const findCartItems = async ({userId, restaurantId,}:{
  userId: string; restaurantId: string | null;
}) => {
  const data = await pool.query(FIND_CART_ITEMS, [restaurantId, userId]);
  return data.rows;
};

