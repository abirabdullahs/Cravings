import { pool } from "@/lib/db";
import { GET_RESTAURANT_REVIEWS, INSERT_REVIEW } from "../query/review.query";
import { toCamelCase } from "@/lib/case";

export interface CreateReviewParams {
  userId: number;
  orderId: number;
  restaurantId: number;
  riderId?: number | null;
  rating: number;
  riderRating?: number | null;
  comment?: string | null;
}

export async function insertReview(params: CreateReviewParams) {
    
  const values = [
    params.userId,
    params.orderId,
    params.restaurantId,
    params.riderId ?? null,
    params.rating,
    params.riderRating ?? null,
    params.comment ?? null,
  ];
  const { rows } = await pool.query(INSERT_REVIEW, values);
  return rows[0];
}

export async function findRestaurantReviews(restaurantId: number) {
  return toCamelCase(
    (await pool.query(GET_RESTAURANT_REVIEWS, [restaurantId])).rows,
  );
}
