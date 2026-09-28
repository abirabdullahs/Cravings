import Link from "next/link";
import Image from "next/image";
import { ShoppingBagIcon } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { LocationAddress } from "@/components/common/location-address";
import { SearchBar } from "@/components/common/search-bar";
import { getCurrentUser } from "@/lib/auth-helper";
import { LogoutButton } from "@/components/auth/logout-button";
import { NavLinks } from "./NavLinks";
import { getCartItems } from "@/server/service/cart.service";
import { NotificationLink } from "./NotificationLink";

type SiteHeaderProps = {
  searchValue?: string;
  cartCount?: number;
};

const riderLinks = [
  { label: "Dashboard", href: "/rider" },
  { label: "Active delivery", href: "/rider/deliveries/active" },
  { label: "Delivery History", href: "/rider/deliveries" },
];

const ownerLinks = [
  { label: "Restaurants", href: "/owner" },
  { label: "Current orders", href: "/owner/orders" },
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
  let resolvedCartCount = cartCount;
  if (isCustomer) {
    try {
      const carts = await getCartItems({
        userId: Number(user!.id),
        restaurantId: null,
      });
      resolvedCartCount = carts.reduce(
        (total, cart) =>
          total + cart.cartItems.reduce((sum, item) => sum + item.quantity, 0),
        0,
      );
    } catch {
      resolvedCartCount = 0;
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 items-center gap-4 px-4 sm:px-6">
        {/* Brand & Location Header Left */}
        <div className="flex items-center gap-3">
          <Logo />
          {isRider && (
            <span className="rounded border border-primary/40 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
              Rider Portal
            </span>
          )}
          {isCustomer && <LocationAddress />}
        </div>

        {/* Global Search Bar */}
        {canBrowse && (
          <div className="mx-auto hidden w-full max-w-md md:block">
            <SearchBar defaultValue={searchValue} />
          </div>
        )}

        {/* Navigation Section */}
        <nav className="ml-auto flex items-center gap-3 sm:gap-6">
          {/* Customer Navigation */}
          {isCustomer && (
            <>
              <Link
                href="/orders"
                className="text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                Orders
              </Link>
              <Link
                href="/cart"
                className="relative inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                <ShoppingBagIcon className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Cart</span>
                {resolvedCartCount > 0 && (
                  <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {resolvedCartCount}
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

          {/* Role Navigations */}
          {isOwner && <NavLinks links={ownerLinks} />}
          {isRider && <NavLinks links={riderLinks} />}
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Admin Panel
            </Link>
          )}

          {/* User Profile Avatar */}
          {user && (
            <Link href="/profile" className="flex items-center gap-2">
              {user.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={user.name ?? "User"}
                  width={32}
                  height={32}
                  className="size-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                  {user.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
              )}
              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold text-foreground">
                  {user.name ?? "User"}
                </p>
              </div>
            </Link>
          )}

          {/* Notifications */}
          {user && <NotificationLink />}

          {/* Auth Actions */}
          {isGuest ? (
            <Link
              href="/login"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Login
            </Link>
          ) : (
            <LogoutButton />
          )}
        </nav>
      </div>

      {(isOwner || isRider) && (
        <div className="border-t border-border px-4 py-2 md:hidden">
          <NavLinks links={isOwner ? ownerLinks : riderLinks} mobile />
        </div>
      )}

      {/* Mobile Search Input */}
      {canBrowse && (
        <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
          <SearchBar defaultValue={searchValue} />
        </div>
      )}
    </header>
  );
}
