import { getRestaurants } from "@/app/server/service/restaurant.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = {
      search: searchParams.get("search") || undefined,
      cuisine: searchParams.get("cuisine") || undefined,
      restaurantId: searchParams.get("restaurantId") || undefined,
      sort: searchParams.get("sort") || undefined,
      area: searchParams.get("area") || undefined,
      limit: Number(searchParams.get("limit")) || undefined,
    };

    const restaurants = await getRestaurants(filter);
    return NextResponse.json(restaurants);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unable to load restaurants";
    return NextResponse.json({ error: message, err }, { status: 500 });
  }
}
