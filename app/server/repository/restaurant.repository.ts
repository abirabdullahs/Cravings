import { pool } from "@/app/lib/db";
import { FIND_RESTAURANTS } from "../query/customer.query";

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
  const result = await pool.query(FIND_RESTAURANTS, data);
  return result.rows;
};
