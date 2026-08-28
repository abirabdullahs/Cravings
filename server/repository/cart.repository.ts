import { pool } from "@/lib/db";
import {
  FIND_CART,
  INSERT_CART,
  UPSERT_CART_ITEM,
  FIND_CART_ITEMS,
} from "../query/cart.query";

interface CartItemsRow {
  id: number;
  menu_item_id: number;
  cart_id: number;
  menu_item_name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
}
// `SELECT id, cart_id, MI.item_name AS menu_item_name, MI.price, quantity, R.name AS restaurant_name

function toCartItem(row: CartItemsRow) {
  return {
    id: row.id,
    menuItemId: row.menu_item_id,
    cartId: row.cart_id,
    menuItemName: row.menu_item_name,
    description: row.description,
    price: row.price,
    image: row.image,
    quantity: row.quantity,
  };
}

export const findCart = async ({
  userId,
  restaurantId,
}: {
  userId: string;
  restaurantId: string;
}) => {
  const data = await pool.query(FIND_CART, [userId, restaurantId]);
  return data.rows[0];
};

export const insertCart = async ({
  userId,
  restaurantId,
}: {
  userId: string;
  restaurantId: string;
}) => {
  const data = await pool.query(INSERT_CART, [userId, restaurantId]);
  return data.rows[0];
};

export const upsertCartItem = async ({
  menuItemId,
  quantity,
  cartId,
}: {
  menuItemId: string;
  quantity: number;
  cartId: string;
}) => {
  const data = await pool.query(UPSERT_CART_ITEM, [
    menuItemId,
    quantity,
    cartId,
  ]);
  return data.rows[0];
};

export const findCartItems = async ({
  userId,
  restaurantId,
}: {
  userId: number;
  restaurantId: number | null;
}) => {
  const cleanId = isNaN(Number(restaurantId)) ? null : Number(restaurantId);
  const data = await pool.query(FIND_CART_ITEMS, [cleanId, userId]);
  return data.rows.map(toCartItem);
};
