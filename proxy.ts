// middleware.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const user = req.auth?.user;
  const userRole = user?.role;
  const { pathname } = req.nextUrl;


  const isProfileIncomplete =
    !user?.phone ||
    user.phone.trim() === "" ||
    !user?.role ||
    user.role.trim() === "";

   console.log(user, isProfileIncomplete, "hey", pathname);

  // 1. Force uncompleted profiles to /complete-profile
  if (isLoggedIn && isProfileIncomplete) {
    if (pathname !== "/complete-profile") {
      return NextResponse.redirect(new URL("/complete-profile", req.url));
    }
    return NextResponse.next();
  }

 if (((isLoggedIn && !isProfileIncomplete) || !isLoggedIn) && pathname === "/complete-profile") {
   return NextResponse.redirect(new URL("/", req.url));
 }

  // 2. Unauthenticated route protection
  if (
    !isLoggedIn &&
    (pathname.startsWith("/admin") ||
      pathname.startsWith("/rider") ||
      pathname.startsWith("/restaurant"))
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. Role-based route protection
  if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/rider") && userRole !== "RIDER") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/restaurant") && userRole !== "OWNER") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  //  Exclude static files, images, favicon, and API routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
