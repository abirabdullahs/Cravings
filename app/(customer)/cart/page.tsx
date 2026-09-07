"use client";

import Link from "next/link";
import { ShoppingBagIcon } from "lucide-react";
import { useCartItems } from "@/hooks/useOrder";

const formatPrice = (amount: number) => `৳${amount.toFixed(0)}`;

export default function CartListPage() {
  const { data: carts = [], isLoading, isError } = useCartItems(null);

  if (isLoading) {
    return (
      <div className="px-4 py-16 text-center text-sm text-muted-foreground">
        Loading your carts...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-4 py-16 text-center text-sm text-red-700">
        Unable to load your carts.
      </div>
    );
  }

  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-[10px] text-muted-foreground">
          Home <span className="px-1">/</span>{" "}
          <span className="text-primary">Your carts</span>
        </p>
        <div className="mt-5 flex items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Your carts
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Continue an order from one of your restaurants.
            </p>
          </div>
          <ShoppingBagIcon className="size-6 text-primary" aria-hidden="true" />
        </div>

        {!carts.length ? (
          <div className="mt-8 border border-dashed border-border px-5 py-14 text-center">
            <ShoppingBagIcon
              className="mx-auto size-8 text-muted-foreground/60"
              aria-hidden="true"
            />
            <h2 className="mt-3 font-serif text-xl font-bold text-foreground">
              No carts yet
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a restaurant and add something delicious.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Browse restaurants
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {carts.map((cart) => {
              const subtotal = cart.cartItems.reduce(
                (sum, item) => sum + Number(item.price) * item.quantity,
                0,
              );
              const itemCount = cart.cartItems.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );
              return (
                <article
                  key={cart.id}
                  className="border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-primary">
                        Restaurant cart
                      </p>
                      <h2 className="mt-1 font-serif text-xl font-bold text-foreground">
                        {cart.restaurantName}
                      </h2>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <Link
                    href={`/cart/${cart.id}`}
                    className="mt-4 block w-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Review and checkout
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
