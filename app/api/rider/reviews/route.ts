import { NextResponse } from "next/server";
import { requireRider } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { getRiderReviews } from "@/server/service/rider.service";

export async function GET() {
  try {
    const user = await requireRider();
    const reviews = await getRiderReviews(Number(user.id));
    return NextResponse.json(reviews, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
