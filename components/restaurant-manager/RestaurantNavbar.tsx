"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const restaurantLinks = [
  { label: "Restaurants", href: "/restaurant" },
  { label: "Current orders", href: "/restaurant/orders" },
];

export function RestaurantNavbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-card">
      {/* <div className="mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto px-4 sm:px-6">
        <span className="shrink-0 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Owner studio
        </span>
        {restaurantLinks.map(({ label, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`shrink-0 border-b-2 py-4 text-sm font-semibold transition ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div> */}
    </nav>
  );
}
