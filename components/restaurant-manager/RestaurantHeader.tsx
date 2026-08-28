import { Pencil, Trash2 } from "lucide-react";
import type { Restaurant } from "@/types/restaurant";

interface RestaurantHeaderProps {
  restaurant: Restaurant;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function RestaurantHeader({
  restaurant,
  busy,
  onEdit,
  onDelete,
}: RestaurantHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-start">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-2xl font-bold text-foreground">
            {restaurant.name}
          </h2>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${
              restaurant.isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                restaurant.isActive ? "bg-primary" : "bg-muted-foreground"
              }`}
            />
            {restaurant.isActive ? "Live" : "Draft"}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{restaurant.address}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 border border-border px-3 py-2 text-xs font-semibold text-foreground hover:border-primary"
        >
          <Pencil className="size-3.5" /> Edit details
        </button>
        <button
          onClick={onDelete}
          disabled={busy}
          className="inline-flex items-center gap-1.5 border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}
