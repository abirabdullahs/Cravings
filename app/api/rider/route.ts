import { NextResponse } from "next/server";
import { requireRider } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";
import { updateRiderStatus } from "@/server/service/rider.service";

// Decision (flagging so it's visible, not buried): rider_status_enum is
// offline | idle | busy. The rider only ever toggles two states —
// "online" (available for work) and "offline". "online" maps to "idle".
// "busy" is set server-side when a delivery is accepted, and the rider
// returns to "idle" after the delivery is completed.
export async function PATCH(request: Request) {
  try {
    const user = await requireRider();
    const { status } = await request.json();

    if (status !== "online" && status !== "offline") {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        "status must be online or offline",
      );
    }

    const dbStatus = status === "online" ? "idle" : "offline";
    await updateRiderStatus(Number(user.id), dbStatus);

    return NextResponse.json({ status }, { status: 200 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
