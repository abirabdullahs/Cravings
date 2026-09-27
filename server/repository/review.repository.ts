import { pool } from "@/lib/db";
import { INSERT_REVIEW } from "../query/review.query";

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
