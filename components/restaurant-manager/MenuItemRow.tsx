import { Archive, LoaderCircleIcon, Pencil, Utensils } from "lucide-react";
import { useState } from "react";
import type { MenuItem } from "@/types/restaurant";

interface MenuItemRowProps {
  item: MenuItem;
  onToggleAvailability: (item: MenuItem) => void | Promise<void>;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void | Promise<void>;
}

export function MenuItemRow({
  item,
  onToggleAvailability,
  onEdit,
  onDelete,
}: MenuItemRowProps) {
  const [pendingAction, setPendingAction] = useState<"toggle" | "delete" | null>(null);

  async function runAction(action: "toggle" | "delete") {
    setPendingAction(action);
    try {
      await (action === "toggle" ? onToggleAvailability(item) : onDelete(item));
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="flex items-center gap-3 py-4">
      <div className="flex size-10 shrink-0 items-center justify-center bg-secondary text-primary">
        <Utensils className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="truncate text-sm font-semibold text-foreground">
            {item.name}
          </h4>
          {item.categoryName && (
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {item.categoryName}
            </span>
          )}
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {item.description || "No description"}
        </p>
      </div>
      <span className="text-sm font-semibold text-foreground">
        ৳{item.price.toFixed(0)}
      </span>
      <button
        onClick={() => void runAction("toggle")}
        disabled={pendingAction !== null}
        className={`hidden border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide sm:block ${item.isAvailable ? "border-primary/30 text-primary" : "border-border text-muted-foreground"}`}
      >
        {pendingAction === "toggle" ? "Saving…" : item.isAvailable ? "Available" : "Hidden"}
      </button>
      <button
        onClick={() => onEdit(item)}
        aria-label={`Edit ${item.name}`}
        className="p-1.5 text-muted-foreground hover:text-primary"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        onClick={() => void runAction("delete")}
        disabled={pendingAction !== null}
        aria-label={`Archive ${item.name}`}
        className="p-1.5 text-muted-foreground hover:text-destructive"
      >
        {pendingAction === "delete" ? (
          <LoaderCircleIcon className="size-3.5 animate-spin" />
        ) : (
          <Archive className="size-3.5" />
        )}
      </button>
    </div>
  );
}
