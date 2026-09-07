"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-red-600"
    >
      <LogOut className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">Sign Out</span>
    </button>
  );
}
