"use client";

import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/http";
import type { RestaurantReview } from "@/types/restaurant";

export function RestaurantReviews({ restaurantId }: { restaurantId: number }) {
  const { data: reviews = [], isLoading } = useQuery<RestaurantReview[]>({
    queryKey: ["reviews", "restaurant", restaurantId],
    queryFn: () =>
      apiRequest<RestaurantReview[]>(
        `/api/reviews?restaurantId=${restaurantId}`,
      ),
  });
  return (
    <section className="mx-auto max-w-6xl border-t border-border px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-serif text-2xl font-bold">Customer reviews</h2>
        {!!reviews.length && (
          <p className="text-sm text-muted-foreground">
            Latest {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {isLoading ? (
        <p className="mt-5 text-sm text-muted-foreground">Loading reviews...</p>
      ) : reviews.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id} className="border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <strong className="text-sm">{review.customerName}</strong>
                <span className="inline-flex items-center gap-1 text-sm font-semibold">
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
        <p className="mt-5 text-sm text-muted-foreground">No reviews yet.</p>
      )}
    </section>
  );
}
