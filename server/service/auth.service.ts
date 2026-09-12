import {
  createUser,
  findUserByEmail,
  findUserById,
  completeUser,
  createRoleRequest,
  listRoleRequests,
  updateRoleRequestStatus,
  approveRoleRequest,
  updateUserProfile,
  getRoleRequestById,
} from "../repository/auth.repository";
import { hashPassword } from "../utils/password";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";

const roles = new Set(["customer", "owner", "rider", "admin"]);

export function normalizeRole(value: string) {
  const normalized = String(value ?? "")
    .toLowerCase()
    .trim();
  if (normalized === "restaurant_owner" || normalized === "owner") {
    return "owner";
  }
  if (normalized === "restaurant-owner") return "owner";
  if (normalized === "restaurant_owner") return "owner";
  if (normalized === "restaurantowner") return "owner";
  if (normalized === "customer") return "customer";
  if (normalized === "rider") return "rider";
  if (normalized === "admin") return "admin";

  if (!roles.has(normalized)) {
    throw new AppError(ErrorCode.INVALID_ROLE);
  }

  return normalized;
}

export const getUserByEmail = (email: string) => {
  return findUserByEmail(email);
};

export const getUserById = (id: string) => {
  return findUserById(id);
};

export const createAccount = async (user: {
  email: string;
  name: string;
  password: string;
  phone: string;
  role: string;
}) => {
  const requestedRole = normalizeRole(user.role);

  if (!roles.has(requestedRole)) {
    throw new AppError(ErrorCode.INVALID_ROLE);
  }

  const existingUser = await findUserByEmail(user.email);
  if (existingUser) {
    throw new AppError(ErrorCode.USER_EXISTS);
  }

  const persistedRole =
    requestedRole === "owner" || requestedRole === "rider"
      ? "customer"
      : requestedRole;

  const data = await createUser({
    email: user.email,
    name: user.name,
    password: await hashPassword(user.password),
    phone: user.phone,
    role: persistedRole,
  });

  if (requestedRole === "owner" || requestedRole === "rider") {
    await createRoleRequest({
      userId: String(data.id),
      currentRole: "customer",
      requestedRole,
      details: `Role request submitted for ${requestedRole}. Pending admin approval.`,
    });
  }

  return { ...data, role: persistedRole, requested_role: requestedRole };
};

export const completeProfile = async ({
  role,
  phone,
  id,
}: {
  role: string;
  phone: string;
  id: string;
}) => {
  const data = await completeUser({ role: normalizeRole(role), phone, id });
  return data;
};

export const submitRoleRequest = async ({
  userId,
  currentRole,
  requestedRole,
  details,
}: {
  userId: string;
  currentRole: string;
  requestedRole: string;
  details?: string;
}) => {
  const normalizedRequestedRole = normalizeRole(requestedRole);
  const normalizedCurrentRole = normalizeRole(currentRole);

  if (["admin"].includes(normalizedRequestedRole)) {
    throw new AppError(ErrorCode.INVALID_ROLE);
  }

  if (!["owner", "rider"].includes(normalizedRequestedRole)) {
    throw new AppError(ErrorCode.INVALID_ROLE);
  }

  return await createRoleRequest({
    userId,
    currentRole: normalizedCurrentRole,
    requestedRole: normalizedRequestedRole,
    details,
  });
};

export const listRequests = async (filters?: {
  status?: string;
  requestedRole?: string;
}) => {
  const rows = await listRoleRequests();
  return rows.filter((row: Record<string, unknown>) => {
    if (
      filters?.status &&
      String(row.status).toUpperCase() !== String(filters.status).toUpperCase()
    ) {
      return false;
    }
    if (
      filters?.requestedRole &&
      String(row.requested_role ?? row.requestedRole ?? "").toLowerCase() !==
        String(filters.requestedRole).toLowerCase()
    ) {
      return false;
    }
    return true;
  });
};

export const getRequestById = async (id: string) => {
  return await getRoleRequestById(id);
};

export const reviewRoleRequest = async ({
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
  const request = await getRoleRequestById(requestId);
  if (!request) {
    throw new AppError(ErrorCode.NOT_FOUND);
  }

  if (status === "APPROVED") {
    await approveRoleRequest({
      userId: String(request.user_id),
      requestedRole: request.requested_role,
    });
  }

  return await updateRoleRequestStatus({
    requestId,
    status,
    reviewedBy,
    reviewNote,
    rejectionReason,
  });
};

export const updateOwnProfile = async ({
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
  return await updateUserProfile({ id, name, phone, profileImage });
};
