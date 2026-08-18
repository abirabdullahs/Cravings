import { pool } from "@/app/lib/db";
import { Find_Restaurants } from "../query/restaurant.query";

export const findRestaurants = async (filter: {
  search?: string;
  category?: string;
  restaurantId?: string;
  limit?: number;
}) => {
  const data = [
    filter.search ?? null,
    filter.category ?? null,
    filter.restaurantId ?? null,
    filter.limit,
  ];
  const result = await pool.query(Find_Restaurants, data);
  return result.rows;
};
