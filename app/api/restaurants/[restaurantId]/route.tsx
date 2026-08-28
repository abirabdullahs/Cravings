import { getRestaurantDetails } from "@/server/service/restaurant.service";
import { apiError } from "@/lib/auth-helper";

type Context = { params: Promise<{ restaurantId: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const { restaurantId } = await params;
    const restaurant = await getRestaurantDetails(restaurantId);

    return new Response(JSON.stringify(restaurant), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return apiError(err);
  }
}
