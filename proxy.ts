// middleware.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { findRoleRequestByUser } from "@/server/repository/auth.repository";

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const user = req.auth?.user;
  const userId = String(user?.id ?? "");
  const userRole = String(user?.role ?? "customer").toLowerCase();

  const isProfileIncomplete =
    !user?.phone ||
    user.phone.trim() === "" ||
    !user?.role ||
    user.role.trim() === "";

  const notLoggedAllowedUrls = [
    "/login",
    "/register",
    "/search",
    "/restaurant",
    "/help",
    "/privacy",
    "/terms",
    "/delivery-areas",
    "/unauthorized",
  ];

  const isNotLoggedAllowed =
    notLoggedAllowedUrls.some((url) => pathname.startsWith(url)) ||
    pathname === "/";

  // 1. Profile Completion Check
  if (isLoggedIn && isProfileIncomplete) {
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.next();
    }
    if (pathname !== "/complete-profile") {
      return NextResponse.redirect(new URL("/complete-profile", req.url));
    }
    return NextResponse.next();
  }

  if (
    ((isLoggedIn && !isProfileIncomplete) || !isLoggedIn) &&
    pathname === "/complete-profile"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 2. Unauthenticated Route Protection
  if (!isLoggedIn) {
    if (!isNotLoggedAllowed) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // 3. Home Page Role Redirection (Redirect staff/admin from "/" to their dashboards)
  if (pathname === "/" && userRole !== "customer") {
    if (userRole === "rider") {
      return NextResponse.redirect(new URL("/rider", req.url));
    }
    if (userRole === "owner") {
      return NextResponse.redirect(new URL("/restaurant", req.url));
    }
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // 4. Admin Protection
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname === "/pending-approval") {
    return NextResponse.next();
  }

  // 5. Rider & Restaurant Route Protection with DB Approval Check
  const isRiderRoute = pathname.startsWith("/rider");
  const isRestaurantRoute =
    pathname.startsWith("/restaurant") || pathname.startsWith("/owner");
  const expectedRole = isRiderRoute
    ? "rider"
    : isRestaurantRoute
      ? "owner"
      : null;

  if (expectedRole) {
    try {
      const requestRow = await findRoleRequestByUser(userId);
      if (
        requestRow?.status === "PENDING" &&
        requestRow?.requested_role === expectedRole
      ) {
        return NextResponse.redirect(new URL("/pending-approval", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Role mismatch check
    if (userRole !== expectedRole) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Role request approval status check from DB repository
    try {
      const requestRow = await findRoleRequestByUser(userId);
      const isApproved =
        requestRow?.status === "APPROVED" &&
        requestRow?.requested_role === expectedRole;

      if (!isApproved) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  // Exclude static assets, images, favicon, and API routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
