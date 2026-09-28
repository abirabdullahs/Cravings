"use client";

import { useState } from "react";
import type { OrderDetail } from "@/types/order";

interface CallTarget {
  label: string;
  phone: string | null;
}

interface OrderSummaryCardProps {
  itemCount: number;
  totalAmount: number;
  paymentMethod: string | null;
  callTargets: CallTarget[];
  receipt?: OrderDetail;
  expandable?: boolean;
}

export function OrderSummaryCard({
  itemCount,
  totalAmount,
  paymentMethod,
  callTargets,
  receipt,
  expandable = false,
}: OrderSummaryCardProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between border border-border bg-secondary/40 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {itemCount} Item{itemCount === 1 ? "" : "s"}
          </p>
          <p className="text-xs text-muted-foreground">
            {paymentMethod ?? "Payment pending"}
          </p>
        </div>
        <div className="text-right">
          <span className="font-serif text-xl font-bold text-primary">
            ৳{totalAmount}
          </span>
          {expandable && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="block text-xs font-semibold text-primary hover:underline"
            >
              {expanded ? "Hide receipt" : "View full receipt"}
            </button>
          )}
        </div>
      </div>

      {expandable && expanded && (
        <div className="border-x border-b border-border px-4 py-3">
          {receipt?.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between gap-4 py-1 text-xs"
            >
              <span className="text-muted-foreground">
                {item.quantity} × {item.name}
              </span>
              <span className="font-semibold text-foreground">
                ৳{item.subtotal}
              </span>
            </div>
          ))}
          {receipt && (
            <dl className="mt-3 space-y-1 border-t border-border pt-3 text-xs">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>৳{receipt.subtotal.toFixed(2)}</dd>
              </div>
              {receipt.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>Discount</dt>
                  <dd>-৳{receipt.discount.toFixed(2)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>Delivery fee</dt>
                <dd>৳{receipt.deliveryFee.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Tax</dt>
                <dd>৳{receipt.tax.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Platform fee</dt>
                <dd>৳{receipt.platformFee.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-bold">
                <dt>Total</dt>
                <dd>৳{receipt.totalAmount.toFixed(2)}</dd>
              </div>
              {receipt.transactionId && (
                <div className="flex justify-between gap-3 pt-2">
                  <dt>Transaction</dt>
                  <dd className="break-all text-right">
                    {receipt.transactionId}
                  </dd>
                </div>
              )}
              {receipt.paidAt && (
                <div className="flex justify-between gap-3">
                  <dt>Paid</dt>
                  <dd>{new Date(receipt.paidAt).toLocaleString()}</dd>
                </div>
              )}
              {receipt.deliveryInstructions && (
                <div className="pt-2">
                  <dt className="font-semibold">Delivery instructions</dt>
                  <dd className="mt-1 text-muted-foreground">
                    {receipt.deliveryInstructions}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {callTargets.map((target) => (
          <a
            key={target.label}
            href={target.phone ? `tel:${target.phone}` : undefined}
            aria-disabled={!target.phone}
            className={`border border-border py-2.5 text-center text-sm font-semibold ${
              target.phone
                ? "text-foreground hover:border-primary"
                : "cursor-not-allowed text-muted-foreground"
            }`}
          >
            {target.label}
          </a>
        ))}
      </div>
    </div>
  );
}
