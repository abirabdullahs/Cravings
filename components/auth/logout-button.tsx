"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.assign("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-foreground transition-colors hover:text-primary"
    >
      Logout
    </button>
  );
}
