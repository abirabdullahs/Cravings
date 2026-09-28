import { pool } from "@/lib/db";
import { executeDml } from "@/lib/dblib";
import {
  GET_RESTAURANT_REVIEWS,
  GET_RIDER_REVIEWS,
  INSERT_REVIEW,
} from "../query/review.query";
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
  const { rows } = await executeDml(INSERT_REVIEW, values);
  return rows[0];
}

export async function findRestaurantReviews(restaurantId: number) {
  return toCamelCase(
    (await pool.query(GET_RESTAURANT_REVIEWS, [restaurantId])).rows,
  );
}

export async function findRiderReviews(riderId: number) {
  return toCamelCase(
    (await pool.query(GET_RIDER_REVIEWS, [riderId])).rows,
  );
}
