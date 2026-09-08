import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (user.role?.toLowerCase() !== "admin") {
    return { user: null, response: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  }

  return { user, response: null };
}

export function adminApiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  return NextResponse.json({ error: message }, { status: 500 });
}

export function getReportDays(value: string | null) {
  return value === "weekly" ? 7 : 28;
}

export function getPlatformFee() {
  const value = Number(process.env.PLATFORM_FEE ?? 0);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}