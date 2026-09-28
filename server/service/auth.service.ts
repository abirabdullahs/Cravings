import {
  createUser,
  findUserByEmail,
  findUserById,
  completeUser,
  createRoleRequest,
  listRoleRequests,
  updateRoleRequestStatus,
  updateUserProfile,
  findRoleRequestByUser,
  getRoleRequestById,
  approveRoleRequestWithProfile,
} from "../repository/auth.repository";
import { hashPassword } from "../utils/password";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";
import {
  sanitizePublicRegistrationRole,
  toSafeUserDTO,
  stripBodyUserOverride,
  normalizeRole,
} from "./auth-security";

const roles = new Set(["customer", "owner", "rider", "admin"]);

export function validateEmail(value: string) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validatePhone(value: string) {
  return typeof value === "string" && /^\+?[0-9()\-\s]{8,20}$/.test(value.trim());
}

export function validateRegistrationInput(input: {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  role?: string;
}) {
  const errors: Record<string, string> = {};
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const role = typeof input.role === "string" ? input.role.trim() : "";
  let normalizedRole = "";

  try {
    normalizedRole = role ? normalizeRole(role) : "";
  } catch {
    normalizedRole = "";
  }

  if (!name || name.length < 2 || name.length > 80) {
    errors.name = "Name must be between 2 and 80 characters.";
  }
  if (!validateEmail(email)) {
    errors.email = "Please provide a valid email address.";
  }
  if (!password || password.length < 8 || password.length > 128) {
    errors.password = "Password must be at least 8 characters long.";
  }
  if (!validatePhone(phone)) {
    errors.phone = "Please provide a valid phone number.";
  }
  if (!normalizedRole || normalizedRole === "admin" || !roles.has(normalizedRole)) {
    errors.role = "Invalid account role selected.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalized: {
      name,
      email: email.toLowerCase(),
      phone,
      role: normalizedRole,
    },
  };
}

export { sanitizePublicRegistrationRole, toSafeUserDTO, stripBodyUserOverride, normalizeRole };

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
  verificationData?: Record<string, unknown>;
}) => {
  const { valid, errors, normalized } = validateRegistrationInput(user);
  if (!valid) {
    throw new AppError(
      ErrorCode.INVALID_INPUT,
      Object.values(errors)[0] ?? "The provided account details are invalid.",
    );
  }

  const requestedRole = normalizeRole(normalized.role);

  if (!roles.has(requestedRole)) {
    throw new AppError(ErrorCode.INVALID_ROLE);
  }

  const existingUser = await findUserByEmail(normalized.email);
  if (existingUser) {
    throw new AppError(ErrorCode.USER_EXISTS);
  }

  const publicRole = sanitizePublicRegistrationRole(normalized.role);
  const persistedRole =
    requestedRole === "owner" || requestedRole === "rider"
      ? "customer"
      : publicRole;

  const data = await createUser({
    email: normalized.email,
    name: normalized.name,
    password: await hashPassword(user.password),
    phone: normalized.phone,
    role: persistedRole,
  });

  if (requestedRole === "owner" || requestedRole === "rider") {
    await createRoleRequest({
      userId: String(data.id),
      currentRole: "customer",
      requestedRole,
      details: `Role request submitted for ${requestedRole}. Pending admin approval.`,
      verificationData: user.verificationData ?? {},
    });
  }

  return toSafeUserDTO({
    ...data,
    role: persistedRole,
    requested_role: requestedRole,
  });
};

export const completeProfile = async ({
  role,
  phone,
  id,
  verificationData,
}: {
  role: string;
  phone: string;
  id: string;
  verificationData?: Record<string, unknown>;
}) => {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "admin") {
    throw new AppError(ErrorCode.INVALID_ROLE);
  }
  const trimmedPhone = String(phone ?? "").trim();
  if (!validatePhone(trimmedPhone)) {
    throw new AppError(ErrorCode.INVALID_PHONE, "Please provide a valid phone number.");
  }
  const data = await completeUser({
    role:
      normalizedRole === "owner" || normalizedRole === "rider"
        ? "customer"
        : normalizedRole,
    phone: trimmedPhone,
    id,
  });

  if (normalizedRole === "owner" || normalizedRole === "rider") {
    await createRoleRequest({
      userId: String(id),
      currentRole: "customer",
      requestedRole: normalizedRole,
      details: `Role request submitted for ${normalizedRole}. Pending admin approval.`,
      verificationData,
    });
  }

  return toSafeUserDTO(data);
};

export const submitRoleRequest = async ({
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
    verificationData,
  });
};

type RoleRequestRow = {
  id?: string | number;
  user_id?: string | number;
  source_role?: string;
  requested_role?: string;
  requestedRole?: string;
  status?: string;
  details?: string;
  verification_data?: Record<string, unknown>;
  created_at?: string;
  reviewed_at?: string | null;
  review_note?: string;
  rejection_reason?: string;
  requester_name?: string;
  requester_email?: string;
  requester_phone?: string;
  source_role_from_user?: string;
};

export const listRequests = async (filters?: {
  status?: string;
  requestedRole?: string;
}) => {
  const rows = await listRoleRequests();
  return rows.filter((row: RoleRequestRow) => {
    if (
      filters?.status &&
      String(row.status ?? "").toUpperCase() !==
        String(filters.status).toUpperCase()
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

export const getRoleRequestForUser = async (userId: string) => {
  return await findRoleRequestByUser(userId);
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
    try {
      const approved = await approveRoleRequestWithProfile({
        requestId,
        reviewedBy,
        reviewNote,
      });
      if (!approved) {
        throw new AppError(
          ErrorCode.INVALID_STATUS,
          "This request has already been reviewed",
        );
      }
      return approved;
    } catch (error) {
      const databaseError = error as { code?: string; constraint?: string };
      if (
        databaseError.code === "DUPLICATE_NID" ||
        (databaseError.code === "23505" &&
          databaseError.constraint?.toLowerCase().includes("nid"))
      ) {
        throw new AppError(ErrorCode.DUPLICATE_IDENTITY);
      }
      if (databaseError.code === "23505") {
        throw new AppError(
          ErrorCode.INVALID_INPUT,
          "The rider vehicle or licence number is already assigned to another account",
        );
      }
      throw error;
    }
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
