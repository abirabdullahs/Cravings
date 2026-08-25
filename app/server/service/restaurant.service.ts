import {
  insertCategory,
  insertMenuItem,
  insertRestaurant,
  deleteCategory,
  deleteMenuItem,
  deleteRestaurant,
  findCategories,
  findMenu,
  findRestaurantByOwner,
  findRestaurants,
  findRestaurantsByOwner,
  setAvailability,
  updateMenuItem,
  updateRestaurant 
} from "../repository/restaurant.repository";

export const getRestaurants = async (filter: {
  search?: string;
  cuisine?: string;
  area?: string;
  sort?: string;
  restaurantId?: string;
  limit?: number;
}) => {
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

export type RestaurantInput = {
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  address: string;
  openingTime?: string;
  closingTime?: string;
  deliveryFee?: number;
  minimumOrder?: number;
  activeStatus?: boolean;
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
    input.activeStatus ?? false,
  ];
}

export const getOwnerRestaurants = (ownerId: string) =>
  findRestaurantsByOwner(ownerId);

export const addRestaurant = async (
  ownerId: string,
  input: RestaurantInput,
) => {
  if (!input.name?.trim() || !input.address?.trim()) {
    throw new Error("NAME_AND_ADDRESS_REQUIRED");
  }
  return insertRestaurant(restaurantValues(ownerId, input));
};

export const getOwnerRestaurant = (restaurantId: string, ownerId: string) =>
  findRestaurantByOwner(restaurantId, ownerId);

export const modifyRestaurant = (
  restaurantId: string,
  ownerId: string,
  input: RestaurantInput,
) =>
  updateRestaurant([
    restaurantId,
    ownerId,
    ...restaurantValues(ownerId, input).slice(1),
  ]);

export const removeRestaurant = (restaurantId: string, ownerId: string) =>
  deleteRestaurant(restaurantId, ownerId);

export const getRestaurantMenu = (restaurantId: string, ownerId: string) =>
  findRestaurantByOwner(restaurantId, ownerId).then((restaurant) =>
    restaurant
      ? Promise.all([findCategories(restaurantId), findMenu(restaurantId)])
      : null,
  );

export const addCategory = async (
  restaurantId: string,
  ownerId: string,
  name: string,
) => {
  if (!(await findRestaurantByOwner(restaurantId, ownerId)))
    throw new Error("RESTAURANT_NOT_FOUND");
  if (!name.trim()) throw new Error("CATEGORY_NAME_REQUIRED");
  return insertCategory(restaurantId, name.trim());
};

export const removeCategory = (
  categoryId: string,
  restaurantId: string,
  ownerId: string,
) =>
  findRestaurantByOwner(restaurantId, ownerId).then(async (restaurant) => {
    if (!restaurant) throw new Error("RESTAURANT_NOT_FOUND");
    return deleteCategory(categoryId, restaurantId);
  });

export const addMenuItem = async (
  restaurantId: string,
  ownerId: string,
  input: {
    categoryId?: number | null;
    name: string;
    description?: string;
    price: number;
    image?: string;
  },
) => {
  if (!(await findRestaurantByOwner(restaurantId, ownerId)))
    throw new Error("RESTAURANT_NOT_FOUND");
  if (!input.name?.trim() || Number(input.price) < 0)
    throw new Error("INVALID_MENU_ITEM");
  return insertMenuItem([
    restaurantId,
    input.categoryId || null,
    input.name.trim(),
    input.description?.trim() || null,
    Number(input.price),
    input.image?.trim() || null,
  ]);
};

export const modifyMenuItem = (
  itemId: string,
  restaurantId: string,
  ownerId: string,
  input: {
    categoryId?: number | null;
    name: string;
    description?: string;
    price: number;
    image?: string;
  },
) =>
  findRestaurantByOwner(restaurantId, ownerId).then((restaurant) => {
    if (!restaurant) throw new Error("RESTAURANT_NOT_FOUND");
    return updateMenuItem([
      itemId,
      restaurantId,
      input.name.trim(),
      Number(input.price),
      input.description?.trim() || null,
      input.categoryId || null,
      input.image?.trim() || null,
    ]);
  });

export const setMenuAvailability = (
  itemId: string,
  restaurantId: string,
  ownerId: string,
  available: boolean,
) =>
  findRestaurantByOwner(restaurantId, ownerId).then((restaurant) => {
    if (!restaurant) throw new Error("RESTAURANT_NOT_FOUND");
    return setAvailability(itemId, restaurantId, available);
  });

export const removeMenuItem = (
  itemId: string,
  restaurantId: string,
  ownerId: string,
) =>
  findRestaurantByOwner(restaurantId, ownerId).then((restaurant) => {
    if (!restaurant) throw new Error("RESTAURANT_NOT_FOUND");
    return deleteMenuItem(itemId, restaurantId);
  });
