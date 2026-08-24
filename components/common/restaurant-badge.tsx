import type { RestaurantBadge } from "@/lib/restaurants"
import { cn } from "@/lib/utils"

const config: Record<RestaurantBadge, { label: string; className: string }> = {
  "top-rated": {
    label: "Top Rated",
    className: "bg-card text-primary",
  },
  popular: {
    label: "Popular",
    className: "bg-card text-primary",
  },
  closed: {
    label: "Closed",
    className: "bg-card text-muted-foreground",
  },
}

export function RestaurantBadgePill({ badge }: { badge: RestaurantBadge }) {
  const { label, className } = config[badge]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-wider shadow-sm",
        className,
      )}
    >
      {label}
    </span>
  )
}
