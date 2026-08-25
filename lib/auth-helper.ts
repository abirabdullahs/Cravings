import { auth } from "@/auth";
import { NextResponse } from "next/server";

// 1. Base check: Works for ANY logged-in user (Customers, Owners, Riders)
export async function getAuthenticatedUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      ),
    };
  }

  return {
    user: session.user as { id: string; email?: string; role?: string },
    errorResponse: null,
  };
}

// 2. Role check: Extends getAuthenticatedUser to guard owner-only routes
export async function requireOwner() {
  const { user, errorResponse } = await getAuthenticatedUser();
  if (errorResponse) return { user: null, response: errorResponse };

  if (user.role?.toLowerCase() !== "owner") {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Owner access required" },
        { status: 403 },
      ),
    };
  }

  return { user, response: null };
}

// 3. Centralized API Error Response Handler
export function apiError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unexpected server error";

  const status =
    message === "RESTAURANT_NOT_FOUND"
      ? 404
      : message === "NAME_AND_ADDRESS_REQUIRED" ||
          message === "INVALID_MENU_ITEM" ||
          message.endsWith("_REQUIRED")
        ? 400
        : 500;

  return NextResponse.json(
    { error: message.replaceAll("_", " ").toLowerCase() },
    { status },
  );
}
