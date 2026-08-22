import { getRestaurants } from "@/app/server/service/restaurant.service";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = {
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      restaurantId: searchParams.get("restaurantId") || undefined,
      limit: Number(searchParams.get("limit")) || undefined
    };
    
    const restaurants = await getRestaurants(filter);
    return NextResponse.json(restaurants);
    
  }
  catch(err: any) {
    return NextResponse.json({error: err.message }, { status: 500 });
  }
  
}