import { auth } from "@/auth";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";

// 1. Base check: Works for ANY logged-in user (Customers, Owners, Riders, Admins)
export async function getAuthenticatedUser() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new AppError(ErrorCode.UNAUTHORIZED);
  }

  return session.user as { id: string; email?: string; role?: string };
}

// 2. Owner-only check
export async function requireOwner() {
  const user = await getAuthenticatedUser();

  if (user.role?.toLowerCase() !== "owner") {
    throw new AppError(ErrorCode.OWNER_ACCESS_REQUIRED);
  }

  return user;
}

// 3. Rider-only check
export async function requireRider() {
  const user = await getAuthenticatedUser();

  if (user.role?.toLowerCase() !== "rider") {
    throw new AppError(ErrorCode.RIDER_ACCESS_REQUIRED);
  }

  return user;
}

// 4. Admin-only check
export async function requireAdmin() {
  const user = await getAuthenticatedUser();

  if (user.role?.toLowerCase() !== "admin") {
    throw new AppError(ErrorCode.ADMIN_ACCESS_REQUIRED);
  }

  return user;
}
