import Link from "next/link";

const links = [
  { label: "Restaurants", href: "/restaurant" },
  { label: "Current orders", href: "/restaurant/orders" },
];

export function RestaurantNavbar() {
  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto px-4 sm:px-6">
        <span className="shrink-0 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Owner studio
        </span>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 border-b-2 border-transparent py-4 text-sm font-semibold text-foreground/75 transition hover:border-primary hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
