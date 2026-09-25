"use client";

import { MinusIcon, PlusIcon, ShoppingBagIcon } from "lucide-react";
import Link from "next/link";
import type { MenuItem } from "@/types/restaurant";

type OrderLine = MenuItem & { quantity: number };

type RestaurantOrderPanelProps = {
  items: OrderLine[];
  cartId?: number;
  restaurantId: number;
  onChange: (item: MenuItem, amount: number) => void;
};

export function RestaurantOrderPanel({
  items,
  cartId,
  restaurantId,
  onChange,
}: RestaurantOrderPanelProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return (
    <aside className="lg:sticky lg:top-[9.5rem] lg:self-start">
      <div className="border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <ShoppingBagIcon className="size-4 text-primary" aria-hidden="true" />
          <h2 className="font-serif text-xl font-bold text-foreground">
            Your order
          </h2>
        </div>
        {items.length ? (
          <div className="p-5">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      ৳{item.price} each
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 border border-border px-1.5 py-1">
                    <button
                      type="button"
                      onClick={() => onChange(item, item.quantity - 1)}
                      aria-label={`Remove one ${item.name}`}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <MinusIcon className="size-3.5" aria-hidden="true" />
                    </button>
                    <span className="w-4 text-center text-xs font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onChange(item, item.quantity + 1)}
                      aria-label={`Add one ${item.name}`}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <PlusIcon className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>৳{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery fee</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-semibold text-foreground">
                <span>Estimated subtotal</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>
            </div>
            <Link
              href={
                restaurantId ? `/cart/restaurant/${restaurantId}` : `/cart/${cartId}`
              }
              className="mt-5 block w-full rounded-sm bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Review order
            </Link>
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <ShoppingBagIcon
              className="mx-auto size-7 text-muted-foreground/60"
              aria-hidden="true"
            />
            <p className="mt-3 font-serif text-base font-bold text-foreground">
              Your order is empty
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Add a dish to start building your order.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
