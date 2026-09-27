import { pool } from "@/lib/db";
import {
  FIND_USER_BY_EMAIL,
  FIND_USER_BY_ID,
  INSERT_USER,
  COMPLETE_USER,
  INSERT_ROLE_REQUEST,
  FIND_ACTIVE_ROLE_REQUEST_BY_USER,
  LIST_ROLE_REQUESTS,
  UPDATE_ROLE_REQUEST_STATUS,
  APPROVE_ROLE_REQUEST,
  UPDATE_USER_PROFILE,
  GET_ROLE_REQUEST_BY_ID,
  INSERT_RIDER_PROFILE,
  INSERT_RESTAURANT_OWNER_PROFILE,
} from "../query/auth.query";
import { User } from "../../types/user";
import { withTransaction } from "@/lib/dblib";

export const findUserByEmail = async (email: string) => {
  const result = await pool.query(FIND_USER_BY_EMAIL, [email]);
  return result.rows[0];
};

export const findUserById = async (id: string) => {
  const result = await pool.query(FIND_USER_BY_ID, [id]);
  return result.rows[0];
};

export const createUser = async (user: User) => {
  const data = [user.email, user.name, user.password, user.phone, user.role];
  const result = await pool.query(INSERT_USER, data);
  return result.rows[0];
};

export const completeUser = async ({
  role,
  phone,
  id,
}: {
  phone: string;
  role: string;
  id: string;
}) => {
  const data = [role, phone, id];
  const result = await pool.query(COMPLETE_USER, data);
  return result.rows[0];
};

export const insertRiderProfile = async ({
  userId,
  vehicleType,
  licensePlate,
}: {
  userId: string;
  vehicleType: string;
  licensePlate: string | null;
}) => {
  const data = [userId, vehicleType, licensePlate];
  const result = await pool.query(INSERT_RIDER_PROFILE, data);
  return result.rows[0];
};

export const insertRestaurantOwnerProfile = async (userId: string) => {
  const result = await pool.query(INSERT_RESTAURANT_OWNER_PROFILE, [userId]);
  return result.rows[0];
};

export const createRoleRequest = async ({
  userId,
  currentRole,
  requestedRole,
  details,
  verificationData,
}: {
  userId: string;
  currentRole: string;
  requestedRole: string;
  details?: string;
  verificationData?: Record<string, unknown>;
}) => {
  const result = await pool.query(INSERT_ROLE_REQUEST, [
    userId,
    currentRole,
    requestedRole,
    details ?? "",
    verificationData ?? {},
  ]);
  return result.rows[0];
};

export const findActiveRoleRequestByUser = async (userId: string) => {
  const result = await pool.query(FIND_ACTIVE_ROLE_REQUEST_BY_USER, [userId]);
  return result.rows[0];
};

export const findRoleRequestByUser = async (userId: string) => {
  return await findActiveRoleRequestByUser(userId);
};

export const listRoleRequests = async () => {
  const result = await pool.query(LIST_ROLE_REQUESTS);
  return result.rows;
};

export const getRoleRequestById = async (id: string) => {
  const result = await pool.query(GET_ROLE_REQUEST_BY_ID, [id]);
  return result.rows[0];
};

export const updateRoleRequestStatus = async ({
  requestId,
  status,
  reviewedBy,
  reviewNote,
  rejectionReason,
}: {
  requestId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy: string;
  reviewNote?: string;
  rejectionReason?: string;
}) => {
  const result = await pool.query(UPDATE_ROLE_REQUEST_STATUS, [
    status,
    reviewedBy,
    reviewNote ?? "",
    rejectionReason ?? "",
    requestId,
  ]);
  return result.rows[0];
};

export const approveRoleRequest = async ({
  userId,
  requestedRole,
}: {
  userId: string;
  requestedRole: string;
}) => {
  const result = await pool.query(APPROVE_ROLE_REQUEST, [
    userId,
    requestedRole,
  ]);
  return result.rows[0];
};

export const approveRoleRequestWithProfile = async ({
  requestId,
  reviewedBy,
  reviewNote,
}: {
  requestId: string;
  reviewedBy: string;
  reviewNote?: string;
}) =>
  withTransaction(async (client) => {
    const requestResult = await client.query(
      `SELECT * FROM role_requests WHERE id = $1 FOR UPDATE`,
      [requestId],
    );
    const request = requestResult.rows[0];
    if (!request || request.status !== "PENDING") return null;

    const nid = String(request.verification_data?.nid_number ?? "")
      .replace(/\s+/g, "")
      .toLowerCase();
    if (nid) {
      const duplicate = await client.query(
        `SELECT id
         FROM role_requests
         WHERE id <> $1
           AND user_id <> $3
           AND status = 'APPROVED'
           AND LOWER(REGEXP_REPLACE(COALESCE(verification_data->>'nid_number', ''), '\\s+', '', 'g')) = $2
         LIMIT 1`,
        [requestId, nid, request.user_id],
      );
      if (duplicate.rowCount) {
        const error = new Error("DUPLICATE_NID") as Error & { code: string };
        error.code = "DUPLICATE_NID";
        throw error;
      }
    }

    await client.query(APPROVE_ROLE_REQUEST, [
      String(request.user_id),
      request.requested_role,
    ]);

    if (request.requested_role === "rider") {
      await client.query(INSERT_RIDER_PROFILE, [
        String(request.user_id),
        request.verification_data?.vehicle_type ?? "BIKE",
        request.verification_data?.vehicle_plate ??
          request.verification_data?.license_number ??
          `RIDER-${request.user_id}`,
      ]);
    } else if (request.requested_role === "owner") {
      await client.query(INSERT_RESTAURANT_OWNER_PROFILE, [
        String(request.user_id),
      ]);
    }

    const reviewed = await client.query(UPDATE_ROLE_REQUEST_STATUS, [
      "APPROVED",
      reviewedBy,
      reviewNote ?? "",
      "",
      requestId,
    ]);
    return reviewed.rows[0];
  });

export const updateUserProfile = async ({
  id,
  name,
  phone,
  profileImage,
}: {
  id: string;
  name?: string;
  phone?: string;
  profileImage?: string;
}) => {
  const result = await pool.query(UPDATE_USER_PROFILE, [
    id,
    name ?? null,
    phone ?? null,
    profileImage ?? null,
  ]);
  return result.rows[0];
};
