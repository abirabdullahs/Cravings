"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClockIcon, MinusIcon, PlusIcon, TagIcon } from "lucide-react";
import { use, useState } from "react";

import { AddressButton } from "@/components/address/AddressSelection";
import { useAddresses } from "@/hooks/useAddressManager";
import { useCartItems, useOrder , useUserCoupons} from "@/hooks/useOrder";
import type { CartItem } from "@/types/order";

const formatPrice = (amount: number) => `৳${Math.round(amount)}`;

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
  const { data: coupons = [], isLoading: isCouponsLoading } = useUserCoupons();
  const {
    createCartItem,
    isCreating,
    placeOrder,
    isPlacingOrder,
    addCoupon,
    isAddingCoupon,
  } = useOrder();

  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("mobile_banking");
  const [selectedCouponId, setSelectedCouponId] = useState<
    number | string | null
  >(null);
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedCart = cartId
    ? carts.find((cart) => cart.id === cartId)
    : carts[0];
  const activeAddressId = selectedAddressId ?? addresses[0]?.id ?? null;
  const activeAddress =
    addresses.find((addr) => addr.id === activeAddressId) ?? addresses[0];

  const [items, setItems] = useState<CartItem[]>(selectedCart?.cartItems ?? []);
  const restaurantName = selectedCart?.restaurantName ?? "Restaurant";

  // Subtotal Calculation
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  const activeCoupon = coupons.find((c) => c.id === selectedCouponId);

  let couponDiscount = selectedCart?.discount ?? 0;
  if (!couponDiscount && activeCoupon && subtotal > 0) {
    if (activeCoupon.discountType === "percentage") {
      couponDiscount = (subtotal * activeCoupon.discountValue) / 100;
    } else {
      couponDiscount = activeCoupon.discountValue;
    }
    couponDiscount = Math.min(couponDiscount, subtotal);
  }

  const vatTaxes = items.length ? Math.round(subtotal * 0.03) : 0;
  const deliveryFee = items.length ? 60 : 0;
  const total = Math.max(0, subtotal + vatTaxes + deliveryFee - couponDiscount);

  // Update item quantity on cart
  const updateQuantity = async (item: CartItem, quantity: number) => {
    if (quantity < 0) return;
    setItems((prevItems) =>
      prevItems.map((i) => (i.id === item.id ? { ...i, quantity } : i)),
    );
    setError(null);
    try {
      await createCartItem({
        menuItemId: item.menuItemId,
        restaurantId: selectedCart!.restaurantId,
        quantity,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update cart",
      );
    }
  };

  // Attach Coupon directly to Cart
  const handleApplyCoupon = async (couponId: number) => {
    setSelectedCouponId(couponId);
    if (!selectedCart || !couponId) return;

    setError(null);
    try {
      await addCoupon({
        cartId: selectedCart.id,
        couponId,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to apply coupon to cart",
      );
    }
  };

  // Submit Order (Copies cart state on backend)
  const submitOrder = async () => {
    if (!selectedCart || activeAddressId === null) {
      setError("Select a delivery address before placing your order.");
      return;
    }
    setError(null);
    try {
      const order = await placeOrder({
        cartId: selectedCart.id,
        addressId: activeAddressId,
        deliveryFee,
        paymentMethod,
      });
      router.push(`/orders/${order.id}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to place order",
      );
    }
  };

  if (isCartLoading || isAddressLoading || isCouponsLoading) {
    return (
      <div className="px-4 py-20 text-center text-sm text-muted-foreground">
        Loading checkout...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        {/* Breadcrumb Navigation */}
        <p className="text-xs text-muted-foreground">
          Home <span className="px-1">/</span> {restaurantName}{" "}
          <span className="px-1">/</span>{" "}
          <span className="font-semibold text-primary">Secure Checkout</span>
        </p>

        {/* Main Layout Grid */}
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column: Items & Receipt */}
          <div className="space-y-6">
            <div className="flex items-baseline justify-between">
              <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
                Your Selection
              </h1>
              <span className="text-xs font-medium text-primary">
                Ordering from {restaurantName}
              </span>
            </div>

            {/* Cart Items List */}
            {!items.length ? (
              <div className="border border-dashed border-border bg-card px-5 py-12 text-center text-sm text-muted-foreground">
                Your cart is empty.{" "}
                <Link href="/" className="text-primary underline">
                  Browse restaurants
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="flex items-center gap-4 border border-border bg-card p-4"
                  >
                    <div className="relative size-16 shrink-0 bg-secondary">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.menuItemName}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="font-serif text-base font-bold text-foreground">
                        {item.menuItemName}
                      </h2>
                      {item.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                          {item.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatPrice(Number(item.price))} per serving
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center border border-border bg-background px-2 py-1">
                      <button
                        type="button"
                        disabled={isCreating}
                        onClick={() => updateQuantity(item, item.quantity - 1)}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                        aria-label={`Decrease ${item.menuItemName}`}
                      >
                        <MinusIcon className="size-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={isCreating}
                        onClick={() => updateQuantity(item, item.quantity + 1)}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                        aria-label={`Increase ${item.menuItemName}`}
                      >
                        <PlusIcon className="size-3" />
                      </button>
                    </div>

                    {/* Price and Remove */}
                    <div className="text-right">
                      <p className="font-serif text-base font-bold text-foreground">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </p>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item, 0)}
                        className="mt-0.5 text-xs text-muted-foreground hover:text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div>
              <Link
                href={`/restaurant/${selectedCart?.restaurantId}`}
                className="inline-block text-xs font-semibold text-primary hover:underline"
              >
                + Add More Items to Your Order
              </Link>
            </div>

            {/* Receipt Summary Card */}
            <div className="border border-border bg-card p-6">
              <h2 className="font-serif text-xl font-bold text-foreground">
                Receipt Summary
              </h2>

              <dl className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Cart Subtotal</dt>
                  <dd className="font-semibold text-foreground">
                    {formatPrice(subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Govt VAT & Taxes</dt>
                  <dd className="font-semibold text-foreground">
                    {formatPrice(vatTaxes)}
                  </dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Delivery Partner Fee</dt>
                  <dd className="font-semibold text-foreground">
                    {formatPrice(deliveryFee)}
                  </dd>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <dt className="flex items-center gap-1 font-semibold">
                      <TagIcon className="size-3" /> Coupon Discount
                      {activeCoupon?.code ? ` (${activeCoupon.code})` : ""}
                    </dt>
                    <dd className="font-semibold">
                      -{formatPrice(couponDiscount)}
                    </dd>
                  </div>
                )}

                <div className="flex justify-between border-t border-border pt-4 font-serif text-lg font-bold text-foreground">
                  <dt>Total Payable</dt>
                  <dd className="text-xl font-extrabold text-foreground">
                    {formatPrice(total)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right Column: Checkout Details Sidebar */}
          <aside className="h-fit border border-border bg-card p-6">
            <h2 className="font-serif text-xl font-bold text-foreground">
              Checkout Details
            </h2>

            <div className="mt-6 space-y-6">
              {/* Delivery Address Section */}
              <section>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Delivery Address
                  </span>
                  <AddressButton
                    onAddressSelect={(addr) =>
                      setSelectedAddressId(addr.id ?? null)
                    }
                    triggerClassName="p-0 text-xs font-semibold text-muted-foreground hover:text-foreground h-auto bg-transparent border-none shadow-none"
                  />
                </div>

                {activeAddress ? (
                  <div className="mt-2 border border-border bg-background p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-xs font-bold text-foreground">
                        {activeAddress.label || "Home (Primary Address)"}
                      </span>
                      <span className="bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-800">
                        Deliver To
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {activeAddress.address}, {activeAddress.city}
                      {activeAddress.postalCode
                        ? `, ${activeAddress.postalCode}`
                        : ""}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 border border-dashed border-border p-3 text-xs text-muted-foreground">
                    No delivery address selected.
                  </p>
                )}
              </section>

              {/* Coupon Selection -> Calls addCoupon on Cart */}
              <section>
                <label
                  htmlFor="coupon-select"
                  className="block text-[10px] font-bold uppercase tracking-wider text-primary"
                >
                  Apply Coupon to Cart
                </label>
                <select
                  id="coupon-select"
                  disabled={isAddingCoupon}
                  value={selectedCouponId ?? ""}
                  onChange={(e) =>
                    handleApplyCoupon(
                     Number(e.target.value)
                    )
                  }
                  className="mt-2 w-full border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                >
                  <option value="">No coupon selected</option>
                  {coupons.map((coupon) => (
                    <option key={coupon.id} value={coupon.id}>
                      {coupon.code} —{" "}
                      {`${coupon.discountValue}${coupon.discountType === "percentage" ? "%" : "৳"} Off`}
                    </option>
                  ))}
                </select>
              </section>

              {/* Payment Method Section */}
              <section>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Select Payment Method
                </span>

                <div className="mt-2 space-y-2">
                  {[
                    {
                      id: "mobile_banking",
                      title: "bKash / Mobile Wallet",
                      subtitle: "Instant 10% cashback applied",
                    },
                    {
                      id: "card",
                      title: "Credit / Debit Card",
                      subtitle: "Visa, Mastercard, AMEX",
                    },
                    {
                      id: "cash",
                      title: "Cash on Delivery",
                      subtitle: "Pay with cash at your door",
                    },
                  ].map((option) => {
                    const isSelected = paymentMethod === option.id;
                    return (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-start gap-3 border p-3 transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={option.id}
                          checked={isSelected}
                          onChange={() =>
                            setPaymentMethod(option.id as PaymentMethod)
                          }
                          className="mt-1 size-3.5 accent-primary"
                        />
                        <div>
                          <p className="font-serif text-xs font-bold text-foreground">
                            {option.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {option.subtitle}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* Delivery Instructions (Optional) */}
              <section>
                <label
                  htmlFor="instructions"
                  className="block text-[10px] font-bold uppercase tracking-wider text-primary"
                >
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  id="instructions"
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="E.g., Leave with security guard, knock quietly..."
                  className="mt-2 w-full border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </section>

              {/* Estimated Delivery Banner */}
              <div className="flex items-start gap-3 border border-emerald-200 bg-emerald-50/70 p-3 text-emerald-900">
                <ClockIcon className="mt-0.5 size-4 shrink-0 text-emerald-700" />
                <div>
                  <p className="text-xs font-bold">
                    Estimated Delivery: 45 - 55 Minutes
                  </p>
                  <p className="mt-0.5 text-[10px] text-emerald-700">
                    Your curator will bring your order hot in thermal bags.
                  </p>
                </div>
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}

              {/* Submit Order Button */}
              <button
                type="button"
                disabled={!items.length || !addresses.length || isPlacingOrder}
                onClick={submitOrder}
                className="w-full bg-primary py-3.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
