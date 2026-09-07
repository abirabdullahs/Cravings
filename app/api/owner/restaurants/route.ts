import { requireOwner } from "@/lib/auth-helper";
import { handleApiError } from "@/lib/errors/handleApiError";
import {
  addRestaurant,
  getOwnerRestaurants,
} from "@/server/service/restaurant.service";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await requireOwner();
  try {
    return NextResponse.json(await getOwnerRestaurants(user.id));
  } catch (error) {
    handleApiError(error, "Unable to fetch restaurants");
  }
}

export async function POST(request: Request) {
  const user = await requireOwner();
  try {
    return NextResponse.json(
      await addRestaurant(user.id, await request.json()),
      { status: 201 },
    );
  } catch (error) {
    handleApiError(error, "Unable to add restaurant");
  }
}
