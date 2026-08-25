import { apiError, requireOwner } from "@/lib/auth-helper";
import {
  addRestaurant,
  getOwnerRestaurants,
} from "@/app/server/service/restaurant.service";
import { NextResponse } from "next/server";

export async function GET() {
  const access = await requireOwner();
  if (access.response) return access.response;
  try {
    return NextResponse.json(await getOwnerRestaurants(access.user.id));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  const access = await requireOwner();
  if (access.response) return access.response;
  try {
    return NextResponse.json(
      await addRestaurant(access.user.id, await request.json()),
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}
