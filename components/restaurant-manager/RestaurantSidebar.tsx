import { ChevronRight } from "lucide-react";
import type { Restaurant } from "@/types/restaurant";

interface RestaurantSidebarProps {
  restaurants: Restaurant[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function RestaurantSidebar({
  restaurants,
  selectedId,
  onSelect,
}: RestaurantSidebarProps) {
  return (
    <aside>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Branches <span className="ml-1 text-foreground">{restaurants.length}</span>
      </p>
      <div className="grid gap-2">
        {restaurants.map((restaurant) => (
          <button
            key={restaurant.id}
            onClick={() => onSelect(restaurant.id)}
            className={`flex items-center justify-between border px-4 py-3 text-left transition ${
              selectedId === restaurant.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">
                {restaurant.name}
              </span>
              <span className="mt-1 block truncate text-xs text-muted-foreground">
                {restaurant.address}
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
        {!restaurants.length && (
          <div className="border border-dashed border-border p-5 text-sm text-muted-foreground">
            No restaurants yet. Add your first branch to start building its menu.
          </div>
        )}
      </div>
    </aside>
  );
}
