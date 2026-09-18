"use client";
import { SectionHeading } from "@/components/common/section-heading";
import { RestaurantCard } from "@/components/restaurant/restaurant-card";
import { usePopularRestaurants } from "@/hooks/useRestaurants";

export function PopularSection() {
  const { data: restaurants, isLoading } = usePopularRestaurants(4);

  return (
    <section className="px-2 pb-16 pt-8 sm:px-14">
      <SectionHeading title="Popular near you" action={{ label: "See all", href: "/search" }} />

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse border border-border bg-secondary/40" />
          ))}
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
    </section>
  );
}