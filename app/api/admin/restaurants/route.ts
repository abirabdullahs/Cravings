import { pool } from "@/lib/db";
import { GET_ALL_RESTAURANTS_WITH_OWNER, UPDATE_RESTAURANT_STATUS_BY_ADMIN } from "@/server/query/admin.query";
import { adminApiError, requireAdmin } from "../_lib";

export async function GET() {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const result = await pool.query(GET_ALL_RESTAURANTS_WITH_OWNER);
    return Response.json({ restaurants: result.rows });
  } catch (error) {
    return adminApiError(error);
  }
}

export async function PATCH(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const payload = await request.json();
    const restaurantId = Number(payload.restaurantId);
    if (!Number.isInteger(restaurantId) || typeof payload.activeStatus !== "boolean") {
      return Response.json({ error: "Restaurant id and active status are required" }, { status: 400 });
    }
    const result = await pool.query(UPDATE_RESTAURANT_STATUS_BY_ADMIN, [restaurantId, payload.activeStatus]);
    if (!result.rows[0]) return Response.json({ error: "Restaurant not found" }, { status: 404 });
    return Response.json({ restaurant: result.rows[0] });
  } catch (error) {
    return adminApiError(error);
  }
}