import Image from "next/image";
import Link from "next/link";
import {
  ChevronRightIcon,
  Clock3Icon,
  MapPinIcon,
  StarIcon,
} from "lucide-react";
import type { RestaurantSummary } from "@/types/restaurant";
import { Rating } from "@/components/common/rating";

export function RestaurantDetailHero({
  restaurant,
}: {
  restaurant: RestaurantSummary;
}) {
  return (
    <section className="border-b border-border ">
      <div className="mx-auto  px-4 py-3 sm:px-14">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-[11px] text-muted-foreground"
        >
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRightIcon className="size-3" aria-hidden="true" />
          <Link href="/search" className="hover:text-primary">
            Restaurants
          </Link>
          <ChevronRightIcon className="size-3" aria-hidden="true" />
          <span className="text-primary">{restaurant.name}</span>
        </nav>
      </div>

      <div className="mx-auto grid max-w-6xl border-x border-t border-border lg:grid-cols-[1fr_1.02fr] bg-card">
        <div className="flex flex-col justify-center p-6 sm:p-10">
          <span className="w-fit rounded-sm bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
            {restaurant.isActive ? "Open now" : "Closed"}
          </span>
          <h1 className="mt-4 font-serif text-4xl font-bold leading-none text-foreground sm:text-5xl">
            {restaurant.name}
          </h1>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            {restaurant.cuisines.join(" • ")} • Traditional
          </p>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {restaurant.name} brings generous Dhaka favorites to your table,
            prepared with familiar spices, slow-cooked meats, and recipes worth
            coming back for.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <Rating value={restaurant.rating} />
              <span className="text-[10px] text-muted-foreground">
                (500+ ratings)
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3Icon
                className="size-3.5 text-primary"
                aria-hidden="true"
              />
              45 min delivery
            </span>
            <span>
              Min. order{" "}
              <strong className="font-semibold text-foreground">
                ৳{restaurant.minimumOrder}
              </strong>
            </span>
          </div>
          <span className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPinIcon className="size-3.5 text-primary" aria-hidden="true" />
            {restaurant.area ?? "Dhaka"}, Dhaka
          </span>
        </div>

        <div className="relative min-h-[280px] overflow-hidden lg:min-h-[330px]">
          <Image
            src={restaurant.imageUrl || "/placeholder.svg"}
            alt={`${restaurant.name} signature dish`}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-sm bg-background/90 px-3 py-2 text-xs font-medium text-foreground backdrop-blur">
            <StarIcon
              className="size-3.5 fill-star stroke-star"
              aria-hidden="true"
            />
            {restaurant.rating} rated locally
          </div>
        </div>
      </div>
    </section>
  );
}
