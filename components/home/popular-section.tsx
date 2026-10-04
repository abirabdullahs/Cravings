"use client";
import { SectionHeading } from "@/components/common/section-heading";
import { RestaurantCard } from "@/components/restaurant/restaurant-card";
import { usePopularRestaurants } from "@/hooks/useRestaurants";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function PopularSection() {
  const { data: restaurants, isLoading } = usePopularRestaurants(4);

  return (
    <section className="px-2 pb-12 pt-12 sm:px-6 lg:px-14">
      <div className="mx-auto max-w-[1500px]">
      <SectionHeading title="Popular near you" action={{ label: "See all", href: "/search" }} />

      {isLoading ? (
        <div role="status" className="mt-6">
          <LoadingSpinner label="Finding popular restaurants…" className="mb-4 text-sm text-primary" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-sm border border-border bg-secondary/40" />
            ))}
          </div>
        </div>
      ) : restaurants?.length ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          No popular restaurants to show yet.
        </p>
      )}
      </div>
    </section>
  );
}
