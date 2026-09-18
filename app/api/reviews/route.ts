import { NextResponse } from "next/server";
import { submitCustomerReview } from "@/server/service/review.service";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    
    const body = await req.json();
    const { orderId, restaurantId, riderId, rating, riderRating, comment } =
      body;

    if (!orderId || !restaurantId || !rating) {
      throw new AppError(ErrorCode.MISSING_FIELD, "Missing required fields.");
    }

    const review = await submitCustomerReview({
      userId: Number(user.id),
      orderId: Number(orderId),
      restaurantId: Number(restaurantId),
      riderId: riderId ? Number(riderId) : null,
      rating: Number(rating),
      riderRating: riderRating ? Number(riderRating) : null,
      comment: comment ?? null,
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
   return handleApiError(error);
  }
}