import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { findRoleRequestByUser } from "@/server/repository/auth.repository";

export default auth(async (req) => {
  const isLoggedIn = !!req.auth?.user;
  const user = req.auth?.user;
  const userRole = user?.role?.toLowerCase();
  const { pathname } = req.nextUrl;
  const isProfileIncomplete =
    !user?.phone ||
    user.phone.trim() === "" ||
    !user?.role ||
    user.role.trim() === "";

  // 1. Force uncompleted profiles to /complete-profile
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

  // 2. Unauthenticated route protection
  if (
    !isLoggedIn &&
    (pathname.startsWith("/admin") ||
      pathname.startsWith("/rider") ||
      pathname.startsWith("/owner"))
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. Role-based route protection
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/rider") && userRole !== "rider") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/restaurant") && userRole !== "owner") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  const expectedRole = pathname.startsWith("/rider") ? "rider" : pathname.startsWith("/restaurant") ? "owner" : "";
  if (expectedRole && user?.id) {
    const requestRow = await findRoleRequestByUser(String(user.id));
    const approved = requestRow?.status === "APPROVED" && requestRow?.requested_role === expectedRole;
    if (!approved) return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  //  Exclude static files, images, favicon, and API routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
