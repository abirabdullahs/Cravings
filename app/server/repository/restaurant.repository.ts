import { pool } from "@/app/lib/db";
import { Find_Restaurants } from "../query/restaurant.query";

export const findRestaurants = async (filter: {
  search?: string;
  category?: string;
  order: "ASC" | "DESC";
  limit?: number;
}) => {
  const data = [
    filter.search ?? null,
    filter.category ?? null,
    filter.order,
    filter.limit,
  ];
  const result = await pool.query(Find_Restaurants, data);
  return result.rows;
};
