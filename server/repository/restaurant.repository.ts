import { pool } from "@/lib/db";
import {
  DELETE_CATEGORY,
  DELETE_MENU_ITEM,
  DELETE_RESTAURANT,
  FIND_CATEGORIES,
  FIND_MENU,
  FIND_RESTAURANT_BY_OWNER,
  FIND_RESTAURANT_BY_ID,
  FIND_RESTAURANTS_BY_OWNER,
  INSERT_CATEGORY,
  INSERT_MENU_ITEM,
  INSERT_RESTAURANT,
  UPDATE_MENU_ITEM_AVAILABILITY,
  UPDATE_MENU_ITEM,
  UPDATE_RESTAURANT,
} from "../query/restaurant.query";
import { FIND_RESTAURANTS , FIND_RESTAURANT_DETAILS} from "../query/customer.query";
import type {
  MenuCategory,
  MenuItem,
  Restaurant,
  RestaurantSearchFilter,
  RestaurantSummary,
} from "../../types/restaurant";

interface RestaurantRow {
  id: number;
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  opening_time: string | null;
  closing_time: string | null;
  delivery_fee: number | string;
  minimum_order: number | string;
  active_status: boolean;
  image?: string | null;
  rating?: number | string | null;
  cuisines?: string[] | null;
  area?: string | null;
}

interface CategoryRow {
  id: number;
  name: string;
}

interface MenuItemRow {
  id: number;
  item_name: string;
  description: string | null;
  price: number | string;
  image: string | null;
  is_available: boolean;
  category_id: number | null;
  category_name: string | null;
}

type SqlValue = string | number | boolean | null;

const numberValue = (value: number | string | null | undefined) =>
  Number(value ?? 0);

function toRestaurantSummary(row: RestaurantRow): RestaurantSummary {
  return {
    id: row.id,
    name: row.name,
    imageUrl: row.image ?? undefined,
    rating: numberValue(row.rating),
    deliveryFee: numberValue(row.delivery_fee),
    minimumOrder: numberValue(row.minimum_order),
    isActive: row.active_status,
    cuisines: row.cuisines ?? [],
    area: row.area ?? undefined,
  };
}

function toRestaurant(row: RestaurantRow): Restaurant {
  return {
    ...toRestaurantSummary(row),
    description: row.description ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    address: row.address,
    openingTime: row.opening_time ?? undefined,
    closingTime: row.closing_time ?? undefined,
  };
}

function toCategory(row: CategoryRow): MenuCategory {
  return { id: row.id, name: row.name };
}

function toMenuItem(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    name: row.item_name,
    description: row.description ?? undefined,
    price: numberValue(row.price),
    imageUrl: row.image ?? undefined,
    isAvailable: row.is_available,
    categoryId: row.category_id ?? undefined,
    categoryName: row.category_name ?? undefined,
  };
}
function getSortClause(sort?: string): string {
  switch (sort) {
    case "top-rated":
      return "ORDER BY R.active_status DESC, R.rating DESC NULLS LAST";
    case "cheapest":
      return "ORDER BY R.active_status DESC, R.minimum_order ASC";
    case "popular":
      return `ORDER BY R.active_status DESC,
        (SELECT COUNT(*) FROM orders o WHERE o.restaurant_id = R.id) DESC`;
    default:
      return "ORDER BY R.active_status DESC, R.name ASC";
  }
}
export const findRestaurants = async (
  filter: RestaurantSearchFilter,
): Promise<RestaurantSummary[]> => {
  const data = [
    filter.search ?? null,
    filter.cuisine ?? null,
    filter.area ?? null,
    filter.restaurantId ?? null,
    filter.limit,
  ];
  const query = `${FIND_RESTAURANTS} ${getSortClause(filter.sort)} LIMIT $5`; 
  const result = await pool.query<RestaurantRow>(query, data);
  return result.rows.map(toRestaurantSummary);
};

export const findRestaurantDetails = async (restaurantId: string) => {
  const result = await pool.query<MenuItemRow>(FIND_RESTAURANT_DETAILS, [
    restaurantId,
  ]);
  return result.rows.map(toMenuItem);
};

export const findRestaurantsByOwner = async (
  ownerId: string,
): Promise<Restaurant[]> =>
  (
    await pool.query<RestaurantRow>(FIND_RESTAURANTS_BY_OWNER, [ownerId])
  ).rows.map(toRestaurant);

export const findRestaurantById = async (
  restaurantId: string,
): Promise<Restaurant | undefined> => {
  const result = await pool.query<RestaurantRow>(FIND_RESTAURANT_BY_ID, [
    restaurantId,
  ]);
  return result.rows[0] ? toRestaurant(result.rows[0]) : undefined;
};

export const findRestaurantByOwner = async (
  restaurantId: string,
  ownerId: string,
): Promise<Restaurant | undefined> => {
  const result = await pool.query<RestaurantRow>(FIND_RESTAURANT_BY_OWNER, [
    restaurantId,
    ownerId,
  ]);
  return result.rows[0] ? toRestaurant(result.rows[0]) : undefined;
};

export const insertRestaurant = async (
  values: SqlValue[],
): Promise<Restaurant | undefined> => {
  const result = await pool.query<RestaurantRow>(INSERT_RESTAURANT, values);
  return result.rows[0] ? toRestaurant(result.rows[0]) : undefined;
};

export const updateRestaurant = async (
  values: SqlValue[],
): Promise<Restaurant | undefined> => {
  const result = await pool.query<RestaurantRow>(UPDATE_RESTAURANT, values);
  return result.rows[0] ? toRestaurant(result.rows[0]) : undefined;
};

export const deleteRestaurant = async (restaurantId: string, ownerId: string) =>
  (await pool.query(DELETE_RESTAURANT, [restaurantId, ownerId])).rowCount;

export const findCategories = async (restaurantId: string) =>
  (await pool.query<CategoryRow>(FIND_CATEGORIES, [restaurantId])).rows.map(
    toCategory,
  );

export const insertCategory = async (restaurantId: string, name: string) =>
  (await pool.query<CategoryRow>(INSERT_CATEGORY, [restaurantId, name]))
    .rows[0];

export const deleteCategory = async (
  categoryId: string,
  restaurantId: string,
) => (await pool.query(DELETE_CATEGORY, [categoryId, restaurantId])).rowCount;

export const findMenu = async (restaurantId: string) =>
  (await pool.query<MenuItemRow>(FIND_MENU, [restaurantId])).rows.map(
    toMenuItem,
  );

export const insertMenuItem = async (
  values: SqlValue[],
): Promise<MenuItem | undefined> => {
  const result = await pool.query<MenuItemRow>(INSERT_MENU_ITEM, values);
  return result.rows[0] ? toMenuItem(result.rows[0]) : undefined;
};

export const updateMenuItem = async (
  values: SqlValue[],
): Promise<MenuItem | undefined> => {
  const result = await pool.query<MenuItemRow>(UPDATE_MENU_ITEM, values);
  return result.rows[0] ? toMenuItem(result.rows[0]) : undefined;
};

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

export const deleteMenuItem = async (itemId: string, restaurantId: string) =>
  (await pool.query(DELETE_MENU_ITEM, [itemId, restaurantId])).rowCount;
