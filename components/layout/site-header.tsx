import Link from "next/link";
import { Bell, ShoppingBagIcon } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LocationAddress } from "@/components/common/location-address";
import { SearchBar } from "@/components/common/search-bar";
import { getCurrentUser } from "@/lib/auth-helper";
import { LogoutButton } from "@/components/auth/logout-button";

type SiteHeaderProps = {
  /** Prefills the header search input (used on the results page) */
  searchValue?: string;
  cartCount?: number;
};

const riderNavLinks = [
  { label: "Dashboard", href: "/rider" },
  { label: "Active delivery", href: "/rider/deliveries/active" },
];

export async function SiteHeader({
  searchValue = "",
  cartCount = 0,
}: SiteHeaderProps) {
  const user = await getCurrentUser();
  const role = user?.role?.toLowerCase();

  const isGuest = !user;
  const isCustomer = role === "customer";
  const isOwner = role === "owner";
  const isRider = role === "rider";
  const isAdmin = role === "admin";
  const canBrowse = isGuest || isCustomer;

  const userData = user;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16  items-center gap-4 px-4 sm:px-6">
        {/* Brand & Location */}
        <div className="flex items-center gap-3">
          <Logo />
          {isRider && (
            <span className="border border-primary/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
              Rider Portal
            </span>
          )}
          {isCustomer && <LocationAddress />}
        </div>

        {/* Global Search (For Customers and Guests) */}
        {canBrowse && (
          <div className="mx-auto hidden w-full max-w-md md:block">
            <SearchBar defaultValue={searchValue} />
          </div>
        )}

        {/* Navigation Links */}
        <nav className="ml-auto flex items-center gap-3 sm:gap-6">
          {/* Customer Specific Links */}
          {isCustomer && (
            <>
              <Link
                href="/cart"
                className="relative inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                <ShoppingBagIcon className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                href="/addresses"
                className="text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                Addresses
              </Link>
            </>
          )}

          {/* Owner Specific Links */}
          {isOwner && (
            <div className="hidden items-center gap-6 text-sm font-medium text-foreground/80 md:flex">
              <Link
                href="/restaurant"
                className="transition-colors hover:text-primary"
              >
                Restaurants
              </Link>
              <Link
                href="/restaurant/orders"
                className="transition-colors hover:text-primary"
              >
                Current orders
              </Link>
            </div>
          )}

          {/* Admin Specific Links */}
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Admin Panel
            </Link>
          )}

          {/* Rider Specific Navigation */}
          {isRider && (
            <div className="hidden items-center gap-6 text-sm font-medium text-foreground/80 md:flex">
              {riderNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Rider Profile Card & Notifications */}
          {userData && isRider && (
            <div className="flex items-center gap-3">
              <button
                aria-label="Notifications"
                className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted"
              >
                <Bell className="size-4" />
              </button>
              <div className="flex items-center gap-2">
                {userData.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userData.profileImage}
                    alt={userData.name ?? "Rider"}
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                    {userData.name?.charAt(0) ?? "R"}
                  </div>
                )}
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-semibold text-foreground">
                    {userData.name ?? "Rider"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    ID: #{userData.id}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Auth Actions */}
          {isGuest && (
            <Link
              href="/login"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Login
            </Link>
          )}

          {!isGuest && <LogoutButton />}
        </nav>
      </div>

      {/* Mobile Search Bar */}
      {canBrowse && (
        <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
          <SearchBar defaultValue={searchValue} />
        </div>
      )}
    </header>
  );
}
