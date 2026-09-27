import { NextResponse } from "next/server";
import { requireRider } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import { getAvailableRequests } from "@/server/service/rider.service";

export async function GET() {
  try {
    await requireRider();
    const requests = await getAvailableRequests();
    return NextResponse.json(requests, { status: 200 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
