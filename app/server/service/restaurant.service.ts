import { findRestaurants } from "../repository/restaurant.repository";

export const getRestaurants = async (filter: {
  search?: string;
  category?: string;
  status?: string;
  order?: string;
  limit?: number;
}) => {

  const { search, category, order, limit } = filter;
  const validatedFilter = {
    search: search?.trim() || undefined,
    category: category?.trim() || undefined,
    order: (order?.toLocaleLowerCase() === "asc" ? "ASC" : "DESC") as "ASC" | "DESC",
    limit: limit || 10,
  }

  const restaurants =  await findRestaurants(validatedFilter);

  return restaurants;

};
