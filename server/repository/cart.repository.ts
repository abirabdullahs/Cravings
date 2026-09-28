import { pool } from "@/lib/db";
import {
  FIND_CART,
  INSERT_CART,
  UPSERT_CART_ITEM,
  DELETE_CART_ITEM,
  FIND_CART_ITEMS,
} from "../query/cart.query";
import type { CartItem } from "@/types/order";
import { executeDml, withTransaction } from "@/lib/dblib";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";

interface CartItemsRow {
  id: number;
  menu_item_id: number;
  cart_id: number;
  restaurant_id: number;
  user_coupon_id: number | null;
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

export const upsertUserCartItem = async ({
  userId,
  restaurantId,
  menuItemId,
  quantity,
}: {
  userId: number;
  restaurantId: number;
  menuItemId: number;
  quantity: number;
}) =>
  withTransaction(async (client) => {
    const cartResult = await client.query(INSERT_CART, [userId, restaurantId]);
    const cart = cartResult.rows[0];

    if (!cart) {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "This restaurant is not available",
      );
    }

    const itemResult = await client.query(UPSERT_CART_ITEM, [
      menuItemId,
      quantity,
      cart.id,
    ]);
    const item = itemResult.rows[0];

    if (!item) {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "This menu item is unavailable or belongs to another restaurant",
      );
    }

    return item;
  });

export const deleteCartItem = async ({
  menuItemId,
  cartId,
}: {
  menuItemId: number;
  cartId: number;
}) => {
  const data = await executeDml(DELETE_CART_ITEM, [cartId, menuItemId]);
  return data.rows[0] ?? null;
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
      userCouponId: number | null;
      cartItems: CartItem[];
    }
  >();
  for (const row of data.rows) {
    const cart = carts.get(row.cart_id) ?? {
      id: row.cart_id,
      restaurantId: row.restaurant_id,
      restaurantName: row.restaurant_name,
      userCouponId: row.user_coupon_id,
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
