import { pool } from "@/lib/db";
import {
  DELETE_CATEGORY,
  DELETE_MENU_ITEM,
  DELETE_RESTAURANT,
  FIND_CATEGORIES,
  FIND_MENU,
  FIND_RESTAURANT_BY_OWNER,
  FIND_RESTAURANTS_BY_OWNER,
  INSERT_CATEGORY,
  INSERT_MENU_ITEM,
  INSERT_RESTAURANT,
  UPDATE_MENU_ITEM_AVAILABILITY,
  UPDATE_MENU_ITEM,
  UPDATE_RESTAURANT,
} from "../query/restaurant.query";
import { FIND_RESTAURANTS } from "../query/customer.query";
function getSortClause(sort?: string): string {
  switch (sort) {
    case "top-rated":
      return "ORDER BY R.active_status DESC, R.rating DESC NULLS LAST";
    case "fastest":
      return "ORDER BY R.active_status DESC, R.delivery_minutes ASC";
    case "cheapest":
      return "ORDER BY R.active_status DESC, R.minimum_order ASC";
    default:
      return "ORDER BY R.active_status DESC, R.name ASC";
  }
}
export const findRestaurants = async (filter: {
  search?: string;
  cuisine?: string;
  area?: string;
  sort?: string;
  restaurantId?: string;
  limit?: number;
}) => {
  const data = [
    filter.search ?? null,
    filter.cuisine ?? null,
    filter.area ?? null,
    filter.restaurantId ?? null,
    filter.limit,
  ];
  const Q = FIND_RESTAURANTS + getSortClause(filter.sort) + " LIMIT $5";
  const result = await pool.query(Q, data);
  console.log(result.rows, data, Q);
  return result.rows;
};

export const findRestaurantsByOwner = async (ownerId: string) =>
  (await pool.query(FIND_RESTAURANTS_BY_OWNER, [ownerId])).rows;

export const addRestaurant = async (values: unknown[]) =>
  (await pool.query(INSERT_RESTAURANT, values)).rows[0];

export const findRestaurantByOwner = async (
  restaurantId: string,
  ownerId: string,
) => (await pool.query(FIND_RESTAURANT_BY_OWNER, [restaurantId, ownerId])).rows[0];
  
export const insertRestaurant = async (values: unknown[]) =>
  (await pool.query(INSERT_RESTAURANT, values)).rows[0];

export const updateRestaurant = async (values: unknown[]) =>
  (await pool.query(UPDATE_RESTAURANT, values)).rows[0];

export const deleteRestaurant = async (
  restaurantId: string,
  ownerId: string,
) => (await pool.query(DELETE_RESTAURANT, [restaurantId, ownerId])).rowCount;

export const findCategories = async (restaurantId: string) =>
  (await pool.query(FIND_CATEGORIES, [restaurantId])).rows;

export const insertCategory = async (restaurantId: string, name: string) =>
  (await pool.query(INSERT_CATEGORY, [restaurantId, name])).rows[0];

export const deleteCategory = async (
  categoryId: string,
  restaurantId: string,
) => (await pool.query(DELETE_CATEGORY, [categoryId, restaurantId])).rowCount;

export const findMenu = async (restaurantId: string) =>
  (await pool.query(FIND_MENU, [restaurantId])).rows;

export const insertMenuItem = async (values: unknown[]) =>
  (await pool.query(INSERT_MENU_ITEM, values)).rows[0];

export const updateMenuItem = async (values: unknown[]) =>
  (await pool.query(UPDATE_MENU_ITEM, values)).rows[0];

export const setAvailability = async (
  itemId: string,
  restaurantId: string,
  available: boolean,
) =>
  (
    await pool.query(UPDATE_MENU_ITEM_AVAILABILITY, [
      itemId,
      restaurantId,
      available,
    ])
  ).rows[0];

export const deleteMenuItem = async (
  itemId: string,
  restaurantId: string,
) => (await pool.query(DELETE_MENU_ITEM, [itemId, restaurantId])).rowCount;
