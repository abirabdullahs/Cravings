import { NextRequest, NextResponse } from "next/server";
import { getRiderDeliveries } from "@/server/service/rider.service";
import { handleApiError } from "@/lib/errors/handleApiError";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";
import { requireRider } from "@/lib/auth-helper";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRider();
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const deliveries = await getRiderDeliveries(Number(user.id), date);
    return NextResponse.json( deliveries, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to fetch rider deliveries");
  }
}
