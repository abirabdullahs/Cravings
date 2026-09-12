import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { findRoleRequestByUser } from "@/server/repository/auth.repository";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/api/auth/signin", request.url));
  }

  const role = String(session.user.role ?? "customer").toLowerCase();
  const userId = String(session.user.id ?? "");

  if (pathname.startsWith("/rider") && role !== "rider") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (pathname.startsWith("/restaurant") && role !== "owner") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (pathname.startsWith("/rider") || pathname.startsWith("/restaurant")) {
    const requestRow = await findRoleRequestByUser(userId);
    const approved = requestRow?.status === "APPROVED" && requestRow?.requested_role === (pathname.startsWith("/rider") ? "rider" : "owner");
    if (!approved) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/rider/:path*", "/restaurant/:path*"],
};
