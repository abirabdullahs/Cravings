"use client";

import { useState } from "react";
import type { TrackingItem } from "@/types/delivery-tracking";

interface CallTarget {
  label: string;
  phone: string | null;
}

interface OrderSummaryCardProps {
  itemCount: number;
  totalAmount: number;
  paymentMethod: string | null;
  callTargets: CallTarget[];
  items?: TrackingItem[];
  expandable?: boolean;
}

export function OrderSummaryCard({
  itemCount,
  totalAmount,
  paymentMethod,
  callTargets,
  items,
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
          {items?.map((item) => (
            <div
              key={`${item.name}-${item.quantity}`}
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
