"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchOrderDetail } from "@/services/orderService";
import { ReviewModal } from "@/components/reviews/ReviewModal";
import type { OrderDetail, OrderHistoryItem } from "@/types/order";

export function OrderHistoryCard({ order }: { order: OrderHistoryItem }) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewed, setReviewed] = useState(order.isReviewed);
  const receipt = useQuery<OrderDetail>({
    queryKey: ["orders", order.id, "detail"],
    queryFn: () => fetchOrderDetail(order.id),
    enabled: showReceipt,
  });

  return (
    <article className="border border-border bg-card p-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="font-bold text-foreground">
            #CRV-{order.id} - {order.restaurantName}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString()} -{" "}
            {order.orderStatus}
            {order.totalItems
              ? ` - ${order.totalItems} item${order.totalItems === 1 ? "" : "s"}`
              : ""}
          </p>
          <p className="mt-1 font-semibold text-primary">
            ৳{order.totalAmount}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/orders/${order.id}`}
            className="border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary"
          >
            Track order
          </Link>
          <button
            type="button"
            onClick={() => setShowReceipt((visible) => !visible)}
            className="bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {showReceipt ? "Hide receipt" : "View receipt"}
          </button>
          {order.orderStatus === "delivered" && !reviewed && (
            <button
              type="button"
              onClick={() => setShowReview(true)}
              className="border border-primary px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              Rate order
            </button>
          )}
        </div>
      </div>

      {showReceipt && (
        <div className="mt-4 border-t border-border pt-3 text-sm">
          {receipt.isLoading ? (
            <p className="text-muted-foreground">Loading receipt...</p>
          ) : receipt.isError ? (
            <p className="text-destructive">Unable to load this receipt.</p>
          ) : receipt.data ? (
            <>
              {receipt.data.items.length ? (
                receipt.data.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4 py-1"
                  >
                    <span className="text-muted-foreground">
                      {item.quantity} × {item.name} @ ৳
                      {item.unitPrice.toFixed(2)}
                    </span>
                    <span className="font-medium text-foreground">
                      ৳{item.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No receipt items found.
                </p>
              )}

              <dl className="mt-3 space-y-1 border-t border-border pt-3">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd>৳{receipt.data.subtotal.toFixed(2)}</dd>
                </div>
                {receipt.data.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <dt>Discount</dt>
                    <dd>-৳{receipt.data.discount.toFixed(2)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>Delivery fee</dt>
                  <dd>৳{receipt.data.deliveryFee.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Tax</dt>
                  <dd>৳{receipt.data.tax.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Platform fee</dt>
                  <dd>৳{receipt.data.platformFee.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-bold">
                  <dt>Total</dt>
                  <dd>৳{receipt.data.totalAmount.toFixed(2)}</dd>
                </div>
                {receipt.data.transactionId && (
                  <div className="flex justify-between gap-3 pt-2">
                    <dt>Transaction</dt>
                    <dd className="break-all text-right">
                      {receipt.data.transactionId}
                    </dd>
                  </div>
                )}
                {receipt.data.paidAt && (
                  <div className="flex justify-between gap-3">
                    <dt>Paid</dt>
                    <dd>{new Date(receipt.data.paidAt).toLocaleString()}</dd>
                  </div>
                )}
                {receipt.data.deliveryInstructions && (
                  <div className="pt-2">
                    <dt className="font-semibold">Delivery instructions</dt>
                    <dd className="mt-1 text-muted-foreground">
                      {receipt.data.deliveryInstructions}
                    </dd>
                  </div>
                )}
              </dl>
            </>
          ) : (
            <p className="text-muted-foreground">No receipt items found.</p>
          )}
        </div>
      )}

      {showReview && (
        <ReviewModal
          orderId={order.id}
          restaurantId={order.restaurantId}
          restaurantName={order.restaurantName}
          riderId={order.riderId}
          riderName={order.riderName}
          onClose={() => setShowReview(false)}
          onSubmitSuccess={() => {
            setReviewed(true);
            setShowReview(false);
          }}
        />
      )}
    </article>
  );
}
