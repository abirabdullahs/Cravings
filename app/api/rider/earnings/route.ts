import { NextResponse } from "next/server";
import { requireRider } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";
import { getRiderEarningsByDate } from "@/server/service/rider.service";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  try {
    const user = await requireRider();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date || !DATE_PATTERN.test(date)) {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "date must be provided as YYYY-MM-DD",
      );
    }

    const earnings = await getRiderEarningsByDate(Number(user.id), date);

    // GET_RIDER_EARNINGS_BY_DATE returns no row at all when there were no
    // deliveries that day (GROUP BY on an empty set) — normalize that into
    // a real zeroed summary instead of returning undefined.
    return NextResponse.json(
      earnings ?? { deliveryDate: date, totalDeliveries: 0, totalIncome: 0 },
      { status: 200 },
    );
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
