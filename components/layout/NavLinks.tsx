"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkItem = { label: string; href: string };

export function NavLinks({ links }: { links: NavLinkItem[] }) {
  const pathname = usePathname();

  return (
    <div className="hidden items-center gap-6 text-sm font-medium md:flex">
      {links.map(({ label, href }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`transition-colors ${
              isActive
                ? "font-semibold text-primary"
                : "text-foreground/80 hover:text-primary"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
