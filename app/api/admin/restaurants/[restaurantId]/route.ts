import { pool } from "@/lib/db";
import { GET_RESTAURANT_PRODUCT_SALES, GET_RESTAURANT_REVIEWS } from "@/server/query/admin.query";
import { adminApiError, getReportDays, requireAdmin } from "../../_lib";

export async function GET(request: Request, { params }: { params: Promise<{ restaurantId: string }> }) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const { restaurantId } = await params;
    const days = getReportDays(new URL(request.url).searchParams.get("range"));
    const [products, reviews] = await Promise.all([
      pool.query(GET_RESTAURANT_PRODUCT_SALES, [restaurantId, days]),
      pool.query(GET_RESTAURANT_REVIEWS, [restaurantId]),
    ]);
    return Response.json({ products: products.rows, reviews: reviews.rows, days });
  } catch (error) {
    return adminApiError(error);
  }
}