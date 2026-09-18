import { pool } from "@/lib/db";
import {
  FIND_CART,
  INSERT_CART,
  UPSERT_CART_ITEM,
  FIND_CART_ITEMS,
} from "../query/cart.query";
import type { CartItem } from "@/types/order";

interface CartItemsRow {
  id: number;
  menu_item_id: number;
  cart_id: number;
  restaurant_id: number;
  menu_item_name: string;
  restaurant_name: string;
  description: string | null;
  price: number;
  image: string | null;
  quantity: number;
}

function toCartItem(row: CartItemsRow): CartItem {
  return {
    id: row.id,
    menuItemId: row.menu_item_id,
    cartId: row.cart_id,
    menuItemName: row.menu_item_name,
    description: row.description ?? undefined,
    price: row.price,
    image: row.image ?? undefined,
    quantity: row.quantity,
  };
}

export const findCart = async ({
  userId,
  restaurantId,
}: {
  userId: number;
  restaurantId: number;
}) => {
  const data = await pool.query(FIND_CART, [userId, restaurantId]);
  return data.rows[0];
};

export const insertCart = async ({
  userId,
  restaurantId,
}: {
  userId: number;
  restaurantId: number;
}) => {
  const data = await pool.query(INSERT_CART, [userId, restaurantId]);
  return data.rows[0];
};

export const upsertCartItem = async ({
  menuItemId,
  quantity,
  cartId,
}: {
  menuItemId: number;
  quantity: number;
  cartId: number;
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
const cleanId = restaurantId === null ? null : Number(restaurantId);
 
  const data = await pool.query(FIND_CART_ITEMS, [cleanId, userId]);
  const carts = new Map<
    number,
    {
      id: number;
      restaurantId: number;
      restaurantName: string;
      cartItems: CartItem[];
    }
  >();
  for (const row of data.rows) {
    const cart = carts.get(row.cart_id) ?? {
      id: row.cart_id,
      restaurantId: row.restaurant_id,
      restaurantName: row.restaurant_name,
      cartItems: [] as CartItem[],
    };
    cart.cartItems.push(toCartItem(row));
    carts.set(row.cart_id, cart);
  }
 
  return [...carts.values()];
};

export const findUserAddresses = async (userId: number) => {
  const data = await pool.query(
    `SELECT id, label, address, street, apartment_name, city, postal_code
     FROM user_addresses
     WHERE user_id = $1
     ORDER BY id ASC`,
    [userId],
  );
  return data.rows.map((row) => ({
    id: row.id,
    label: row.label,
    address: row.address,
    street: row.street,
    apartmentName: row.apartment_name,
    city: row.city,
    postalCode: row.postal_code,
  }));
};
