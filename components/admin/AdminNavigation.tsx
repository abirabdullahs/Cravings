"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { label: "Overview", href: "/admin" },
  { label: "Operations", href: "/admin/operations" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Users", href: "/admin/users" },
  { label: "Marketing", href: "/admin/marketing" },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6">
        {adminLinks.map(({ label, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 px-3 py-4 text-sm font-semibold transition ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
