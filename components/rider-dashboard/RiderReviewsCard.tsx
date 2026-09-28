"use client";

import { Star } from "lucide-react";
import { useRiderReviews } from "@/hooks/useRider";

export function RiderReviewsCard() {
  const { data: reviews = [], isLoading, error } = useRiderReviews();
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) /
      reviews.length
    : 0;

  return (
    <section className="mt-8 border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-foreground">
            Customer reviews
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Delivery feedback from your completed orders
          </p>
        </div>
        {!!reviews.length && (
          <div className="flex items-center gap-1 text-sm font-semibold">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            {average.toFixed(1)}/5 · {reviews.length} review
            {reviews.length === 1 ? "" : "s"}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse border border-border bg-muted/50"
            />
          ))}
        </div>
      ) : error ? (
        <p className="mt-5 text-sm text-destructive">
          {error instanceof Error ? error.message : "Could not load reviews."}
        </p>
      ) : reviews.length ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id} className="border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {review.customerName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Order #{review.orderId} · {review.restaurantName}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {review.rating}/5
                </span>
              </div>
              {review.comment && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {review.comment}
                </p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">
          No delivery reviews yet.
        </p>
      )}
    </section>
  );
}
