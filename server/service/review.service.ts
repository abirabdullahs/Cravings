import { ErrorCode } from "@/lib/errors/errorCodes";
import { insertReview } from "../repository/review.repository";
import { AppError } from "@/lib/errors/AppError";

export const submitCustomerReview = async (
  {userId, orderId, restaurantId, riderId, rating, riderRating, comment}: {
    userId: number;
    orderId: number;
    restaurantId: number;
    riderId?: number | null;
    rating: number;
    riderRating?: number | null;
    comment?: string | null;
  }
) => {
  if (rating < 1 || rating > 5) {
    throw new AppError(ErrorCode.INVALID_INPUT,
    "Restaurant rating must be between 1 and 5.");
  }
  if (
    riderRating != null &&
    (riderRating < 1 || riderRating > 5)
  ) {
    throw new AppError(
      ErrorCode.INVALID_INPUT,
      "Delivery rating must be between 1 and 5.",
    );
  }

  return await insertReview({
    userId,
    orderId,
    restaurantId,
    riderId,
    rating,
    riderRating,
    comment
  });
}
