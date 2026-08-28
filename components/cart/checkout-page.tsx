"use client";

import Image from "next/image";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

type CartItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
};

const initialItems: CartItem[] = [
  {
    id: 1,
    name: "Sultan's Signature Kacchi",
    description: "With Premium Potato, Extra Beresta",
    price: 550,
    quantity: 2,
    image: "/food/sultans-dine.png",
  },
  {
    id: 2,
    name: "Crispy Shahi Jali Kabab",
    description: "Lacy egg net golden fried patties",
    price: 120,
    quantity: 3,
    image: "/food/kacchi-bhai.png",
  },
  {
    id: 3,
    name: "Chilled Mint Borhani",
    description: "Traditional whipped cold borhani",
    price: 60,
    quantity: 2,
    image: "/food/ambala.png",
  },
];

const formatPrice = (amount: number) => `৳${amount}`;

export function CheckoutPage() {
  const [items, setItems] = useState(initialItems);
  const [paymentMethod, setPaymentMethod] = useState("wallet");

  const updateQuantity = (id: number, change: number) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const deliveryFee = items.length ? 60 : 0;
  const discount = subtotal >= 1000 ? 50 : 0;
  const total = subtotal + deliveryFee - discount;

  return (
    <div className="bg-background">
      <div className="mx-auto px-4 pb-14 pt-5 sm:px-14 lg:pt-6">
        <p className="text-[10px] text-muted-foreground">
          Home <span className="px-1">/</span> Sultan&apos;s Dine
          <span className="px-1">/</span>{" "}
          <span className="text-primary">Secure Checkout</span>
        </p>

        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_370px] lg:gap-8">
          <section>
            <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
              Your Selection
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Ordering from Sultan&apos;s Dine
            </p>

            <div className="mt-5 space-y-2">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="flex gap-3 border border-border bg-card p-2 sm:gap-4 sm:p-3"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden bg-secondary sm:size-14">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-bold text-foreground">
                      {item.name}
                    </h2>
                    <p className="mt-0.5 text-[10px] text-primary">
                      {item.description}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {formatPrice(item.price)} per serving
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end justify-between">
                    <div className="flex items-center border border-border bg-background">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="grid size-6 place-items-center text-muted-foreground hover:text-primary"
                        aria-label={`Remove one ${item.name}`}
                      >
                        <MinusIcon className="size-3" aria-hidden="true" />
                      </button>
                      <span className="w-5 text-center text-xs font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="grid size-6 place-items-center text-muted-foreground hover:text-primary"
                        aria-label={`Add one ${item.name}`}
                      >
                        <PlusIcon className="size-3" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -item.quantity)}
                        className="text-[9px] text-muted-foreground underline underline-offset-2 hover:text-primary"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="mt-4 text-[11px] text-primary underline underline-offset-4 hover:text-foreground"
            >
              + Add More Items to Your Order
            </button>

            <div className="mt-7 border border-border bg-card p-4 sm:p-5">
              <h2 className="font-serif text-base font-bold text-foreground">
                Receipt Summary
              </h2>
              <dl className="mt-4 space-y-2 text-[11px] text-muted-foreground">
                <div className="flex justify-between">
                  <dt>Cart Subtotal</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Govt VAT &amp; Taxes</dt>
                  <dd>{formatPrice(35)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Delivery Partner Fee</dt>
                  <dd>{formatPrice(deliveryFee)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Campaign Discount</dt>
                  <dd className="text-green-700">-{formatPrice(discount)}</dd>
                </div>
              </dl>
              <div className="mt-3 flex justify-between border-t border-border pt-3 font-serif text-base font-bold text-foreground">
                <span>Total Payable</span>
                <span className="text-primary">{formatPrice(total + 35)}</span>
              </div>
            </div>
          </section>

          <aside className="h-fit border border-border bg-card p-4 sm:p-5 lg:mt-0">
            <h2 className="font-serif text-xl font-bold text-foreground">
              Checkout Details
            </h2>
            <div className="mt-5 space-y-5">
              <section>
                <div className="flex items-center justify-between text-[9px] uppercase text-primary">
                  <h3>Delivery Address</h3>
                  <button
                    type="button"
                    className="normal-case text-muted-foreground underline"
                  >
                    Change
                  </button>
                </div>
                <div className="mt-2 border border-border p-3 text-[10px]">
                  <p className="font-semibold">
                    Home (Primary Address){" "}
                    <span className="ml-1 bg-green-100 px-1 text-[8px] text-green-700">
                      DELIVER TO
                    </span>
                  </p>
                  <p className="mt-1 leading-relaxed text-muted-foreground">
                    House 42, Road 7/A, Dhanmondi R/A, Near Satmasjid Road,
                    Dhaka 1209
                  </p>
                </div>
              </section>

              <fieldset>
                <legend className="text-[9px] uppercase text-primary">
                  Select Payment Method
                </legend>
                <div className="mt-2 space-y-1">
                  {[
                    [
                      "wallet",
                      "bKash / Mobile Wallet",
                      "Instant 10% cashback applied",
                    ],
                    ["card", "Credit / Debit Card", "Visa, Mastercard, AMEX"],
                    ["cash", "Cash on Delivery", "Pay with cash at your door"],
                  ].map(([value, label, detail]) => (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-start gap-2 border p-2.5 text-[10px] ${paymentMethod === value ? "border-primary bg-primary/10" : "border-border"}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={value}
                        checked={paymentMethod === value}
                        onChange={() => setPaymentMethod(value)}
                        className="mt-0.5 accent-primary"
                      />
                      <span>
                        <span className="block font-semibold">{label}</span>
                        <span className="text-[9px] text-muted-foreground">
                          {detail}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="block text-[9px] uppercase text-primary">
                Delivery Instructions (Optional)
                <textarea
                  placeholder="E.g. Leave with security guard, knock quietly..."
                  className="mt-2 min-h-16 w-full resize-none border border-border bg-background p-2 text-[10px] normal-case outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </label>
              <div className="border border-green-200 bg-green-50 p-3 text-[10px] text-green-700">
                <p className="font-semibold">
                  Estimated Delivery: 45 - 55 Minutes
                </p>
                <p className="text-[9px]">
                  Your curator will bring your order hot in thermal bags.
                </p>
              </div>
              <button
                type="button"
                className="w-full bg-primary px-4 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90"
              >
                Place Order (Payable {formatPrice(total + 35)})
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
