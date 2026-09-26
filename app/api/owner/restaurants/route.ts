import { requireOwner } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import {
  addRestaurant,
  getOwnerRestaurants,
} from "@/server/service/restaurant.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireOwner();
    const archived = request.nextUrl.searchParams.get("archived") === "true";
    return NextResponse.json(await getOwnerRestaurants(user.id, archived));
  } catch (error) {
    return handleApiError(error, "Unable to fetch restaurants");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireOwner();
    return NextResponse.json(
      await addRestaurant(user.id, await request.json()),
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error, "Unable to add restaurant");
  }
}
