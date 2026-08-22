import { findRestaurants } from "../repository/restaurant.repository";

export const getRestaurants = async (filter: {
  search?: string;
  category?: string;
  status?: string;
  restaurantId?: string;
  limit?: number;
}) => {

  const { search, category, restaurantId, limit } = filter;
  const validatedFilter = {
    search: search?.trim() || undefined,
    category: category?.trim() || undefined,
    restaurantId: restaurantId?.trim() || undefined,
    limit: limit || 10,
  };

  const restaurants =  await findRestaurants(validatedFilter);

  return restaurants;

};
