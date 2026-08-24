"use client";

import { useMemo, useState, useEffect } from "react";
import { CUISINES, type Restaurant } from "@/lib/restaurants";
import { RestaurantCard } from "@/components/restaurant/restaurant-card";
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

  const [results, setResults] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    let isMounted = true;

    async function fetchRestaurants() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set("search", query);
        if (cuisine !== "all") params.set("cuisine", cuisine);
        if (area !== "all") params.set("area", area);
        params.set("sort", sort);

        const res = await fetch(`/api/restaurants?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch restaurants");

        const data = await res.json();
        if (isMounted) {
          const formattedData = data.map((item:any) => ({
            id: item.id,
            name: item.name,
            image: item.image_url,
            rating: item.rating,
            deliveryFee: item.delivery_fee,
            minOrder: item.minimum_order,
            isOpen: item.is_open,
            cuisines: item.cuisines
          }));
          setResults(formattedData);
        }
      } catch (err) {
        console.error("Error fetching restaurant data:", err);
        if (isMounted) setResults([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchRestaurants();

    return () => {
      isMounted = false;
    };
  }, [query, cuisine, area, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
     
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
