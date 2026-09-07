"use client";

import Image from "next/image";
import Link from "next/link";
import { MinusIcon, PlusIcon } from "lucide-react";
import { use, useState } from "react";
import { useAddresses, useCartItems, useOrder } from "@/hooks/useOrder";
import type { CartItem } from "@/types/order";

const formatPrice = (amount: number) => `৳${amount.toFixed(0)}`;

type PaymentMethod = "card" | "mobile_banking" | "bank_transfer" | "cash";

export function CheckoutPage({
  cartId,
  restaurantId,
}: {
  cartId?: number;
  restaurantId?: number;
}) {
  const { data: carts = [], isLoading: isCartLoading } = useCartItems(
    restaurantId ?? null,
  );
  const { data: addresses = [], isLoading: isAddressLoading } = useAddresses();
  const { createCartItem, isCreating, placeOrder, isPlacingOrder } = useOrder();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [error, setError] = useState<string | null>(null);
  const [isPlaced, setIsPlaced] = useState(false);

  const selectedCart = cartId
    ? carts.find((cart) => cart.id === cartId)
    : carts[0];
  const activeAddressId = selectedAddressId ?? addresses[0]?.id ?? null;
  const items = selectedCart?.cartItems ?? [];
  const restaurantName = selectedCart?.restaurantName ?? "Restaurant";
  const deliveryFee = items.length ? 60 : 0;
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );
  const total = subtotal + deliveryFee;

  const updateQuantity = async (item: CartItem, quantity: number) => {
    if (quantity < 1) return;
    setError(null);
    try {
      await createCartItem(
        item.menuItemId,
        selectedCart!.restaurantId,
        quantity,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update cart",
      );
    }
  };

  const submitOrder = async () => {
    if (!selectedCart || activeAddressId === null) {
      setError("Select a delivery address before placing your order.");
      return;
    }
    setError(null);
    try {
      await placeOrder({
        cartId: selectedCart.id,
        addressId: activeAddressId,
        deliveryFee,
        paymentMethod,
      });
      setIsPlaced(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to place order",
      );
    }
  };

  if (isCartLoading || isAddressLoading) {
    return (
      <div className="px-4 py-16 text-center text-sm text-muted-foreground">
        Loading checkout...
      </div>
    );
  }

  if (isPlaced) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Order placed
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your restaurant has received the order.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Continue browsing
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="mx-auto px-4 pb-14 pt-5 sm:px-14 lg:pt-6">
        <p className="text-[10px] text-muted-foreground">
          Home <span className="px-1">/</span> {restaurantName}{" "}
          <span className="px-1">/</span>{" "}
          <span className="text-primary">Secure Checkout</span>
        </p>
        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_370px] lg:gap-8">
          <section>
            <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
              Your Selection
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Ordering from {restaurantName}
            </p>
            {!items.length ? (
              <div className="mt-5 border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
                Your cart is empty.{" "}
                <Link href="/" className="text-primary underline">
                  Browse restaurants
                </Link>
              </div>
            ) : (
              <div className="mt-5 space-y-2">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="flex gap-3 border border-border bg-card p-2 sm:gap-4 sm:p-3"
                  >
                    <div className="relative size-12 shrink-0 overflow-hidden bg-secondary sm:size-14">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.menuItemName}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-bold text-foreground">
                        {item.menuItemName}
                      </h2>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {item.description}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {formatPrice(Number(item.price))} each
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end justify-between">
                      <div className="flex items-center border border-border bg-background">
                        <button
                          type="button"
                          disabled={isCreating}
                          onClick={() =>
                            updateQuantity(item, item.quantity - 1)
                          }
                          className="grid size-6 place-items-center text-muted-foreground hover:text-primary"
                          aria-label={`Remove one ${item.menuItemName}`}
                        >
                          <MinusIcon className="size-3" aria-hidden="true" />
                        </button>
                        <span className="w-5 text-center text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={isCreating}
                          onClick={() =>
                            updateQuantity(item, item.quantity + 1)
                          }
                          className="grid size-6 place-items-center text-muted-foreground hover:text-primary"
                          aria-label={`Add one ${item.menuItemName}`}
                        >
                          <PlusIcon className="size-3" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-foreground">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="h-fit border border-border bg-card p-4 sm:p-5">
            <h2 className="font-serif text-xl font-bold text-foreground">
              Checkout Details
            </h2>
            <div className="mt-5 space-y-5">
              <fieldset>
                <legend className="text-[9px] uppercase text-primary">
                  Delivery Address
                </legend>
                {addresses.length ? (
                  <div className="mt-2 space-y-2">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block cursor-pointer border p-3 text-[10px] ${selectedAddressId === address.id ? "border-primary bg-primary/10" : "border-border"}`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={activeAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="mr-2 accent-primary"
                        />
                        <span className="font-semibold">
                          {address.label || "Delivery address"}
                        </span>
                        <span className="mt-1 block text-muted-foreground">
                          {address.address}, {address.city}
                          {address.postalCode ? ` ${address.postalCode}` : ""}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 border border-dashed border-border p-3 text-[10px] text-muted-foreground">
                    Add a delivery address to place an order.
                  </p>
                )}
              </fieldset>
              <fieldset>
                <legend className="text-[9px] uppercase text-primary">
                  Select Payment Method
                </legend>
                <div className="mt-2 space-y-1">
                  {(
                    [
                      ["cash", "Cash on Delivery"],
                      ["mobile_banking", "bKash / Mobile Wallet"],
                      ["card", "Credit / Debit Card"],
                    ] as const
                  ).map(([value, label]) => (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-center gap-2 border p-2.5 text-[10px] ${paymentMethod === value ? "border-primary bg-primary/10" : "border-border"}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={value}
                        checked={paymentMethod === value}
                        onChange={() => setPaymentMethod(value)}
                        className="accent-primary"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <dl className="space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <dt>Cart subtotal</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Delivery fee</dt>
                  <dd>{formatPrice(deliveryFee)}</dd>
                </div>
                <div className="flex justify-between pt-2 text-sm font-semibold text-foreground">
                  <dt>Total payable</dt>
                  <dd className="text-primary">{formatPrice(total)}</dd>
                </div>
              </dl>
              {error && <p className="text-xs text-red-700">{error}</p>}
              <button
                type="button"
                disabled={!items.length || !addresses.length || isPlacingOrder}
                onClick={submitOrder}
                className="w-full bg-primary px-4 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPlacingOrder
                  ? "Placing order..."
                  : `Place Order (Payable ${formatPrice(total)})`}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function CartCheckoutRoute({
  params,
}: {
  params: Promise<{ cartId: string }>;
}) {
  const { cartId } = use(params);
  const numericCartId = Number(cartId);

  if (!Number.isInteger(numericCartId) || numericCartId < 1) {
    return (
      <p className="p-8 text-center text-sm text-muted-foreground">
        Cart not found.
      </p>
    );
  }

  return <CheckoutPage cartId={numericCartId} />;
}
