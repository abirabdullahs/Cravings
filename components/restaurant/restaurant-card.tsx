import Image from "next/image";
import Link from "next/link";
import { ClockIcon } from "lucide-react";
import type { RestaurantSummary } from "@/types/restaurant";
import { Rating } from "@/components/common/rating";
import { cn } from "@/lib/utils";

type RestaurantCardProps = {
  restaurant: RestaurantSummary;
  className?: string;
  /** Image sizes hint for responsive loading */
  sizes?: string;
};

export function RestaurantCard({
  restaurant,
  className,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
}: RestaurantCardProps) {
  const {
    id,
    name,
    imageUrl,
    rating,
    deliveryFee,
    minimumOrder,
    isActive,
    cuisines,
  } = restaurant;

  return (
    <Link
      href={`/restaurant/${id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-sm border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={name}
          fill
          sizes={sizes}
          className={cn(
            "object-cover transition-transform duration-300 group-hover:scale-105",
            !isActive && "grayscale-[35%] brightness-90",
          )}
        />
        {/* {badge ? (
          <div className="absolute left-3 top-3">
            <RestaurantBadgePill badge={badge} />
          </div>
        ) : null} */}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-lg font-bold leading-tight text-foreground">
            {name}
          </h3>
          <Rating value={rating} className="mt-0.5 shrink-0" />
        </div>
        <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {cuisines.join(" • ")}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="size-3.5" aria-hidden="true" />
            {deliveryFee} tk
          </span>
          <span>
            Min.{" "}
            <span className="font-medium text-foreground">৳{minimumOrder}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
