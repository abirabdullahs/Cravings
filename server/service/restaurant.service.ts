import {
  insertCategory,
  insertMenuItem,
  insertRestaurant,
  deleteCategory,
  archiveMenuItem,
  archiveRestaurant,
  restoreMenuItem,
  restoreRestaurant,
  findCategories,
  findArchivedMenu,
  findCategoryForRestaurant,
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
  Restaurant,
} from "../../types/restaurant";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";

async function requireOwnedRestaurant(restaurantId: string, ownerId: string) {
  const restaurant = await findRestaurantByOwner(restaurantId, ownerId);
  if (!restaurant) throw new AppError(ErrorCode.RESTAURANT_NOT_FOUND);
  return restaurant;
}

async function requireCategoryForRestaurant(
  categoryId: number | null,
  restaurantId: string,
) {
  if (categoryId == null) return;
  const category = await findCategoryForRestaurant(String(categoryId), restaurantId);
  if (!category) {
    throw new AppError(
      ErrorCode.CATEGORY_NOT_FOUND,
      "The selected category does not belong to this restaurant",
    );
  }
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
    input.area?.trim() || null,
    input.latitude,
    input.longitude,
    input.openingTime || null,
    input.closingTime || null,
    Number(input.deliveryFee ?? 0),
    Number(input.minimumOrder ?? 0),
    input.isActive,
    input.imageUrl?.trim() || null,
    input.cuisines.map((cuisine) => cuisine.trim()).filter(Boolean),
  ];
}

function restaurantToInput(restaurant: Restaurant): RestaurantInput {
  return {
    name: restaurant.name,
    description: restaurant.description ?? "",
    phone: restaurant.phone ?? "",
    email: restaurant.email ?? "",
    address: restaurant.address,
    area: restaurant.area ?? "",
    latitude: restaurant.latitude ?? null,
    longitude: restaurant.longitude ?? null,
    cuisines: restaurant.cuisines,
    openingTime: restaurant.openingTime ?? "",
    closingTime: restaurant.closingTime ?? "",
    deliveryFee: restaurant.deliveryFee,
    minimumOrder: restaurant.minimumOrder,
    isActive: restaurant.isActive,
    imageUrl: restaurant.imageUrl ?? "",
  };
}

function validateRestaurant(input: RestaurantInput) {
  if (!input.name?.trim() || !input.address?.trim()) {
    throw new AppError(
      ErrorCode.MISSING_FIELD,
      "Name and address are required",
    );
  }
  if (input.latitude == null || input.longitude == null) {
    throw new AppError(
      ErrorCode.MISSING_FIELD,
      "Select the restaurant location on the map",
    );
  }
  if (
    !Number.isFinite(input.deliveryFee) ||
    input.deliveryFee < 0 ||
    !Number.isFinite(input.minimumOrder) ||
    input.minimumOrder < 0 ||
    (input.latitude != null &&
      (!Number.isFinite(input.latitude) || Math.abs(input.latitude) > 90)) ||
    (input.longitude != null &&
      (!Number.isFinite(input.longitude) || Math.abs(input.longitude) > 180))
  ) {
    throw new AppError(ErrorCode.INVALID_INPUT, "Invalid restaurant details");
  }
}

export const getOwnerRestaurants = (ownerId: string, archived = false) =>
  findRestaurantsByOwner(ownerId, archived);

export const addRestaurant = async (
  ownerId: string,
  input: RestaurantInput,
) => {
  const completeInput: RestaurantInput = {
    ...input,
    area: input.area ?? "",
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    cuisines: Array.isArray(input.cuisines) ? input.cuisines : [],
  };
  validateRestaurant(completeInput);
  return insertRestaurant(restaurantValues(ownerId, completeInput));
};

export const getOwnerRestaurant = (restaurantId: string, ownerId: string) =>
  findRestaurantByOwner(restaurantId, ownerId);

export const modifyRestaurant = async (
  restaurantId: string,
  ownerId: string,
  input: Partial<RestaurantInput>,
) => {
  const existing = await requireOwnedRestaurant(restaurantId, ownerId);
  const completeInput: RestaurantInput = {
    ...restaurantToInput(existing),
    ...input,
    cuisines: Array.isArray(input.cuisines)
      ? input.cuisines
      : existing.cuisines,
  };
  validateRestaurant(completeInput);
  return updateRestaurant([
    restaurantId,
    ownerId,
    ...restaurantValues(ownerId, completeInput).slice(1),
  ]);
};

export const removeRestaurant = (restaurantId: string, ownerId: string) =>
  archiveRestaurant(restaurantId, ownerId);

export const unarchiveRestaurant = async (
  restaurantId: string,
  ownerId: string,
) => {
  await requireOwnedRestaurant(restaurantId, ownerId);
  return restoreRestaurant(restaurantId, ownerId);
};

export const getRestaurantMenu = async (
  restaurantId: string,
  ownerId: string,
): Promise<RestaurantMenu> => {
  await requireOwnedRestaurant(restaurantId, ownerId);
  const [categories, items, archivedItems] = await Promise.all([
    findCategories(restaurantId),
    findMenu(restaurantId),
    findArchivedMenu(restaurantId),
  ]);
  return { categories, items, archivedItems };
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
    throw new AppError(ErrorCode.INVALID_INPUT, "Invalid menu item");
  await requireOwnedRestaurant(restaurantId, ownerId);
  await requireCategoryForRestaurant(input.categoryId, restaurantId);
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
  if (!input.name?.trim() || Number(input.price) < 0) {
    throw new AppError(ErrorCode.INVALID_INPUT, "Invalid menu item");
  }
  await requireCategoryForRestaurant(input.categoryId, restaurantId);
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
  return archiveMenuItem(itemId, restaurantId);
};

export const unarchiveMenuItem = async (
  itemId: string,
  restaurantId: string,
  ownerId: string,
) => {
  await requireOwnedRestaurant(restaurantId, ownerId);
  return restoreMenuItem(itemId, restaurantId);
};
