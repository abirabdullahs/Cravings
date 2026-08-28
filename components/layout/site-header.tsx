import Link from "next/link";
import { ShoppingBagIcon } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LocationPill } from "@/components/common/location-pill";
import { SearchBar } from "@/components/common/search-bar";
import { getAuthenticatedUser } from "@/lib/auth-helper";

type SiteHeaderProps = {
  /** Prefills the header search input (used on the results page) */
  searchValue?: string;
  cartCount?: number;
};

export async function SiteHeader({
  searchValue = "",
  cartCount = 0,
}: SiteHeaderProps) {
  const { user } = await getAuthenticatedUser();
  const role = user?.role?.toLowerCase();
  const isGuest = !user;
  const isCustomer = role === "customer";
  const isOwner = role === "owner";
  const canBrowse = isGuest || isCustomer;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-8xl items-center gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <LocationPill className="hidden sm:inline-flex" />
        </div>
        {canBrowse && (
          <div className="mx-auto hidden w-full max-w-md md:block">
            <SearchBar defaultValue={searchValue} />
          </div>
        )}

        <nav className="ml-auto flex items-center gap-2 sm:gap-4">
          {isCustomer && (
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              <ShoppingBagIcon className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Cart</span> ({cartCount})
            </Link>
          )}
          {isOwner && (
            <Link
              href="/restaurant"
              className="hidden text-sm font-medium text-foreground transition-colors hover:text-primary sm:inline"
            >
              Owner studio
            </Link>
          )}
          {isCustomer && (
            <Link
              href="/profile"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Profile
            </Link>
          )}
          {isGuest && (
            <Link
              href="/login"
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              Login
            </Link>
          )}
        </nav>
      </div>

      {canBrowse && (
        <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
          <SearchBar defaultValue={searchValue} />
        </div>
      )}
    </header>
  );
}
