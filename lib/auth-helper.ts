import { auth } from "@/auth";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";
import { getUserByEmail } from "@/server/service/auth.service";

type AuthenticatedUser = { id: string; email?: string; role?: string };

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return session.user as AuthenticatedUser;
}

// 1. Base check: Works for ANY logged-in user (Customers, Owners, Riders, Admins)
export async function getAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError(ErrorCode.UNAUTHORIZED);
  }

  const databaseUser = user.email ? await getUserByEmail(user.email) : null;

  if (!databaseUser) {
    throw new AppError(ErrorCode.UNAUTHORIZED);
  }

  return {
    id: String(databaseUser.id),
    email: databaseUser.email,
    role: databaseUser.role,
  };
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
