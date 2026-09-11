import { NextResponse } from "next/server";
import { requireRider } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";
import { getRiderProfile } from "@/server/service/rider.service";

export async function GET() {
  try {
    const user = await requireRider();
    const profile = await getRiderProfile(Number(user.id));

    if (!profile) {
      throw new AppError(ErrorCode.NOT_FOUND, "Rider profile not found");
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
