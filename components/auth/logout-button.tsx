"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.refresh(); // Clears client-side router cache
    router.push("/login");
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
