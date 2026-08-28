import Image from "next/image";
import { SearchBar } from "@/components/common/search-bar";

export function Hero() {
  return (
    <section className="px-2 pr-2 pt-8 sm:pl-14 sm:pr-10">
      <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col justify-center py-4 lg:py-10">
          <h1 className="font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground text-balance sm:text-5xl">
            What are you Craving today.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground text-pretty">
            Order from your Dhaka street favorites and premium local bistros
            with transparent pricing and real-time delivery estimates.
          </p>
          <div className="mt-7 max-w-lg">
            <SearchBar
              placeholder="Search for kacchi, burgers, coffees..."
              buttonLabel="Find food"
            />
          </div>
        </div>

        <div className="relative -mr-2 aspect-[4/3] overflow-hidden rounded-l-sm sm:-mr-10 lg:aspect-auto lg:min-h-[360px]">
          <Image
            src="/food/hero-spread.png"
            alt="A spread of Dhaka favorites — cheeseburger, kacchi biryani, and grilled kebabs"
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
