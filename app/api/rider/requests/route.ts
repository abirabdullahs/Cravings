import { NextResponse } from "next/server";
import { requireRider } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { getAvailableRequests } from "@/server/service/rider.service";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";

export async function GET(request: Request) {
  try {
    const user = await requireRider();
    const searchParams = new URL(request.url).searchParams;
    const latitudeParam = searchParams.get("latitude");
    const longitudeParam = searchParams.get("longitude");
    const latitude = Number(latitudeParam);
    const longitude = Number(longitudeParam);

    if (
      latitudeParam === null ||
      longitudeParam === null ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "A valid GPS location is required to find nearby orders",
      );
    }

    const requests = await getAvailableRequests(
      Number(user.id),
      latitude,
      longitude,
    );
    return NextResponse.json(requests, { status: 200 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
