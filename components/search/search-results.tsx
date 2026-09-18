"use client";

import { useMemo, useState } from "react";
import { CUISINES } from "@/lib/restaurants";
import { RestaurantCard } from "@/components/restaurant/restaurant-card";
import { useRestaurants } from "@/hooks/useRestaurants";
import {
  ResultsToolbar,
  type SortKey,
} from "@/components/search/results-toolbar";

export function SearchResults({
  query,
  city = "Dhaka",
}: {
  query: string;
  city?: string;
}) {
  const [cuisine, setCuisine] = useState("all");
  const [area, setArea] = useState("all");
  const [sort, setSort] = useState<SortKey>("recommended");

  const { data: results = [], isLoading } = useRestaurants({
    search: query || undefined,
    cuisine: cuisine === "all" ? undefined : cuisine,
    area: area === "all" ? undefined : area,
    sort: sort === "recommended" ? undefined : sort,
  });

  const cuisineOptions = useMemo(
    () => [
      { value: "all", label: "All Cuisines" },
      ...CUISINES.filter((c) => c.key !== "all").map((c) => ({
        value: c.key,
        label: c.label,
      })),
    ],
    [],
  );

  const areaOptions = useMemo(
    () => [
      { value: "all", label: "All Areas" },
      { value: "Dhanmondi", label: "Dhanmondi" },
      { value: "Banani", label: "Banani" },
      { value: "Gulshan", label: "Gulshan" },
      { value: "Old Dhaka", label: "Old Dhaka" },
    ],
    [],
  );

  return (
    <div className="mx-auto px-2 pb-16 pt-8 sm:px-14">
      <ResultsToolbar
        cuisine={cuisine}
        cuisineOptions={cuisineOptions}
        onCuisineChange={setCuisine}
        area={area}
        areaOptions={areaOptions}
        onAreaChange={setArea}
        sort={sort}
        onSortChange={setSort}
      />

      <div className="mt-6 flex items-center gap-4">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {results.length} establishment{results.length === 1 ? "" : "s"}
          </span>{" "}
          currently available in {city}
        </p>
        <span className="hidden h-px flex-1 bg-border sm:block" />
      </div>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <p className="font-serif text-lg font-bold text-foreground">
            No restaurants match your filters
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different cuisine, area, or search term.
          </p>
        </div>
      )}
    </div>
  );
}
