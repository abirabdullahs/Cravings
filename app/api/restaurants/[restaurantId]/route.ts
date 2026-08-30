import { handleApiError } from "@/lib/errors/handleApiError";
import { getRestaurantDetails } from "@/server/service/restaurant.service";
import { NextResponse } from "next/server";
type Context = { params: Promise<{ restaurantId: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const { restaurantId } = await params;
    const restaurant = await getRestaurantDetails(restaurantId);

    return new NextResponse(JSON.stringify(restaurant), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    handleApiError(err, "Unable to fetch restaurant");
  }
}
