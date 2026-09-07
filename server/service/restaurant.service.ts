import {
  insertCategory,
  insertMenuItem,
  insertRestaurant,
  deleteCategory,
  deleteMenuItem,
  deleteRestaurant,
  findCategories,
  findMenu,
  findRestaurantDetails,
  findRestaurantById,
  findRestaurantByOwner,
  findRestaurants,
  findRestaurantsByOwner,
  setAvailability,
  updateMenuItem,
  updateRestaurant,
} from "../repository/restaurant.repository";
import type {
  MenuItemInput,
  RestaurantInput,
  RestaurantSearchFilter,
  RestaurantMenu,
} from "../../types/restaurant";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";

async function requireOwnedRestaurant(restaurantId: string, ownerId: string) {
  const restaurant = await findRestaurantByOwner(restaurantId, ownerId);
  if (!restaurant) throw new AppError(ErrorCode.RESTAURANT_NOT_FOUND);
}

export const getRestaurants = async (filter: RestaurantSearchFilter) => {
  const { search, cuisine, area, sort, restaurantId, limit } = filter;
  const validatedFilter = {
    search: search?.trim() || undefined,
    cuisine: cuisine?.trim() || undefined,
    area: area?.trim() || undefined,
    restaurantId: restaurantId?.trim() || undefined,
    sort: sort?.trim() || undefined,
    limit: limit || 10,
  };

  const restaurants = await findRestaurants(validatedFilter);

  return restaurants;
};

export const getRestaurantDetails = async (restaurantId: string) => {
  const restaurant = await findRestaurantById(restaurantId);
  if (!restaurant) throw new AppError(ErrorCode.RESTAURANT_NOT_FOUND);
  const [categories, items] = await Promise.all([
    findCategories(restaurantId),
    findRestaurantDetails(restaurantId)
  ]);
  return {
    restaurant,
    menu: { categories, items},
  };
};

function restaurantValues(ownerId: string, input: RestaurantInput) {
  return [
    ownerId,
    input.name.trim(),
    input.description?.trim() || null,
    input.phone?.trim() || null,
    input.email?.trim() || null,
    input.address.trim(),
    input.openingTime || null,
    input.closingTime || null,
    Number(input.deliveryFee ?? 0),
    Number(input.minimumOrder ?? 0),
    input.isActive,
  ];
}

export const getOwnerRestaurants = (ownerId: string) =>
  findRestaurantsByOwner(ownerId);

export const addRestaurant = async (
  ownerId: string,
  input: RestaurantInput,
) => {
  if (!input.name?.trim() || !input.address?.trim()) {
    throw new AppError(ErrorCode.MISSING_FIELD,"Name and Adress are required");
  }
  return insertRestaurant(restaurantValues(ownerId, input));
};

export const getOwnerRestaurant = (restaurantId: string, ownerId: string) =>
  findRestaurantByOwner(restaurantId, ownerId);

export const modifyRestaurant = (
  restaurantId: string,
  ownerId: string,
  input: RestaurantInput,
) => {
  requireOwnedRestaurant(restaurantId, ownerId);
  return updateRestaurant([
    restaurantId,
    ownerId,
    ...restaurantValues(ownerId, input).slice(1),
  ]);
};

export const removeRestaurant = (restaurantId: string, ownerId: string) =>
  deleteRestaurant(restaurantId, ownerId);

export const getRestaurantMenu = async (
  restaurantId: string,
  ownerId: string,
): Promise<RestaurantMenu> => {
  await requireOwnedRestaurant(restaurantId, ownerId);
  const [categories, items] = await Promise.all([
    findCategories(restaurantId),
    findMenu(restaurantId),
  ]);
  return { categories, items };
};

export const addCategory = async (
  restaurantId: string,
  ownerId: string,
  name: string,
) => {
  await requireOwnedRestaurant(restaurantId, ownerId);
  if (!name.trim()) throw new AppError(ErrorCode.MISSING_FIELD, "Category name is required");
  return insertCategory(restaurantId, name.trim());
};

export const removeCategory = async (
  categoryId: string,
  restaurantId: string,
  ownerId: string,
) => {
  await requireOwnedRestaurant(restaurantId, ownerId);
  return deleteCategory(categoryId, restaurantId);
};

export const addMenuItem = async (
  restaurantId: string,
  ownerId: string,
  input: MenuItemInput,
) => {
  if (!input.name?.trim() || Number(input.price) < 0)
    throw new Error("INVALID_MENU_ITEM");
  await requireOwnedRestaurant(restaurantId, ownerId);
  return insertMenuItem([
    restaurantId,
    input.categoryId || null,
    input.name.trim(),
    input.description?.trim() || null,
    Number(input.price),
    input.imageUrl.trim() || null,
  ]);
};

export const modifyMenuItem = async (
  itemId: string,
  restaurantId: string,
  ownerId: string,
  input: MenuItemInput,
) => {
  await requireOwnedRestaurant(restaurantId, ownerId);
  return updateMenuItem([
    itemId,
    restaurantId,
    input.name.trim(),
    Number(input.price),
    input.description?.trim() || null,
    input.categoryId || null,
    input.imageUrl.trim() || null,
  ]);
};

export const setMenuAvailability = async (
  itemId: string,
  restaurantId: string,
  ownerId: string,
  available: boolean,
) => {
  await requireOwnedRestaurant(restaurantId, ownerId);
  return setAvailability(itemId, restaurantId, available);
};

export const removeMenuItem = async (
  itemId: string,
  restaurantId: string,
  ownerId: string,
) => {
  await requireOwnedRestaurant(restaurantId, ownerId);
  return deleteMenuItem(itemId, restaurantId);
};
