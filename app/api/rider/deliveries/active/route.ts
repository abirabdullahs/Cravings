import { NextResponse } from "next/server";
import { requireRider } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { getActiveDeliveryForRider } from "@/server/service/rider.service";

export async function GET() {
  try {
    const user = await requireRider();
    const delivery = await getActiveDeliveryForRider(Number(user.id));
  
    return NextResponse.json(delivery ?? null, { status: 200 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
