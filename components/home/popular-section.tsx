import { restaurants } from "@/lib/restaurants"
import { SectionHeading } from "@/components/common/section-heading"
import { RestaurantCard } from "@/components/restaurant/restaurant-card"

export function PopularSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <SectionHeading
        title="Popular near you"
        action={{ label: "See all", href: "/search" }}
      />
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </section>
  )
}
