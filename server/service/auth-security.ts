import { AppError } from "../../lib/errors/AppError.ts";
import { ErrorCode } from "../../lib/errors/errorCodes.ts";

export function sanitizePublicRegistrationRole(value: string) {
  const normalized = String(value ?? "").toLowerCase().trim();

  if (normalized === "admin" || normalized === "owner" || normalized === "rider") {
    return "customer";
  }

  return "customer";
}

export function toSafeUserDTO<T extends Record<string, unknown>>(user: T) {
  const safeUser = { ...user };
  delete safeUser.password_hash;
  delete safeUser.password;
  return safeUser;
}

export function stripBodyUserOverride(
  input: Record<string, unknown>,
  authenticatedUserId: string,
) {
  const { userId: _ignoredUserId, ...rest } = input;
  return {
    ...rest,
    userId: authenticatedUserId,
  };
}

export function normalizeRole(value: string) {
  const normalized = String(value ?? "").toLowerCase().trim();

  if (normalized === "restaurant_owner" || normalized === "owner") return "owner";
  if (normalized === "restaurant-owner" || normalized === "restaurantowner") return "owner";
  if (normalized === "customer") return "customer";
  if (normalized === "rider") return "rider";
  if (normalized === "admin") return "admin";

  throw new AppError(ErrorCode.INVALID_ROLE);
}
