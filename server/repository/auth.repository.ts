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
} from "../query/auth.query";
import { User } from "../../types/user";

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
  const result = await pool.query(APPROVE_ROLE_REQUEST, [userId, requestedRole]);
  return result.rows[0];
};

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
