"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function LogoutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ redirect: false });
      window.location.assign("/login");
    } catch {
      setIsSigningOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isSigningOut}
      className="text-sm font-medium text-foreground transition-colors hover:text-primary disabled:cursor-wait disabled:opacity-60"
    >
      {isSigningOut ? <LoadingSpinner label="Signing out…" /> : "Logout"}
    </button>
  );
}
