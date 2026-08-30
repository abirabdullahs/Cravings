"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function UnauthorizedPage() {
  const { data: session } = useSession();
  const role = session?.user?.role?.toLowerCase();

  let homeLink = "/";
  if (role === "owner") homeLink = "/owner";
  else if (role === "rider") homeLink = "/rider";
  else if (role === "admin") homeLink = "/admin";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/10 px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-primary mb-4">403</h1>
          <p className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </p>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>

        {session ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You are logged in as a{" "}
              <span className="font-semibold capitalize">{role}</span>.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href={homeLink}
                className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Go to Home
              </Link>
              <Link
                href="/login"
                className="px-6 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
              >
                Sign In as Different Role
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please sign in to access this page.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
