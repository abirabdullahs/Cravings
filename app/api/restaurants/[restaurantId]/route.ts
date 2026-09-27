import { handleApiError } from "@/lib/errors/handleApiError";
import { getRestaurantDetails } from "@/server/service/restaurant.service";
import { NextResponse } from "next/server";
type Context = { params: Promise<{ restaurantId: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const { restaurantId } = await params;
    const restaurant = await getRestaurantDetails(restaurantId);

    return NextResponse.json(restaurant, { status: 200 });
  } catch (err) {
    return handleApiError(err, "Unable to fetch restaurant");
  }
}
