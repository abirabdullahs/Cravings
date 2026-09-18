import { pool } from "@/lib/db";
import { GET_ALL_RIDERS, UPDATE_RIDER_STATUS_BY_ADMIN } from "@/server/query/admin.query";
import { adminApiError, requireAdmin } from "../_lib";

export async function GET() {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const result = await pool.query(GET_ALL_RIDERS);
    return Response.json({ riders: result.rows });
  } catch (error) {
    return adminApiError(error);
  }
}

export async function PATCH(request: Request) {
  const access = await requireAdmin();
  if (access.response) return access.response;

  try {
    const payload = await request.json();
    const riderId = Number(payload.riderId);
    const status = payload.status;
    if (!Number.isInteger(riderId) || !["offline", "idle", "busy"].includes(status)) {
      return Response.json({ error: "Rider id and valid status are required" }, { status: 400 });
    }
    const result = await pool.query(UPDATE_RIDER_STATUS_BY_ADMIN, [riderId, status]);
    if (!result.rows[0]) return Response.json({ error: "Rider not found" }, { status: 404 });
    return Response.json({ rider: result.rows[0] });
  } catch (error) {
    return adminApiError(error);
  }
}