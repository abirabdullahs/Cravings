import { ErrorCode } from "@/lib/errors/errorCodes";
import { pool } from "@/lib/db";
import { findRestaurantReviews, insertReview } from "../repository/review.repository";
import { AppError } from "@/lib/errors/AppError";

export const submitCustomerReview = async (
  { userId, orderId, restaurantId, riderId, rating, riderRating, comment }: {
    userId: number;
    orderId: number;
    restaurantId?: number;
    riderId?: number | null;
    rating: number;
    riderRating?: number | null;
    comment?: string | null;
  },
) => {
  if (rating < 1 || rating > 5) {
    throw new AppError(
      ErrorCode.INVALID_INPUT,
      "Restaurant rating must be between 1 and 5.",
    );
  }
  if (riderRating != null && (riderRating < 1 || riderRating > 5)) {
    throw new AppError(
      ErrorCode.INVALID_INPUT,
      "Delivery rating must be between 1 and 5.",
    );
  }

  const orderRow = (
    await pool.query(
      `
        SELECT o.id, o.user_id, o.restaurant_id, o.order_status, d.rider_id
        FROM orders o
        LEFT JOIN deliveries d ON d.order_id = o.id
        WHERE o.id = $1
      `,
      [orderId],
    )
  ).rows[0];

  if (!orderRow) {
    throw new AppError(ErrorCode.NOT_FOUND, "Order not found");
  }

  if (Number(orderRow.user_id) !== userId) {
    throw new AppError(ErrorCode.FORBIDDEN, "You can only review your own orders");
  }

  if (String(orderRow.order_status).toLowerCase() !== "delivered") {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      "Only delivered orders can be reviewed.",
    );
  }

  const resolvedRestaurantId = Number(restaurantId ?? orderRow.restaurant_id);
  const resolvedRiderId = riderId ?? (orderRow.rider_id == null ? null : Number(orderRow.rider_id));

  return await insertReview({
    userId,
    orderId,
    restaurantId: resolvedRestaurantId,
    riderId: resolvedRiderId,
    rating,
    riderRating,
    comment,
  });
};

export const getRestaurantReviews = async (restaurantId: number) => {
  if (!Number.isInteger(restaurantId) || restaurantId < 1) {
    throw new AppError(ErrorCode.INVALID_INPUT, "Invalid restaurant ID");
  }
  return findRestaurantReviews(restaurantId);
};
