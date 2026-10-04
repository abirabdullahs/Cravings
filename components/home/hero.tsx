"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/common/search-bar";
import { useToast } from "@/components/ui/toast-provider";

const slides = [
  {
    eyebrow: "Dhaka favourites",
    title: "What are you craving today?",
    description:
      "From smoky kebabs to comforting biryani, your next favourite meal is only a few taps away.",
    image: "/food/hero-spread.png",
    alt: "A spread of burgers, biryani, and grilled kebabs",
    query: "",
  },
  {
    eyebrow: "A royal feast",
    title: "Kacchi that makes the day better.",
    description:
      "Fragrant rice, tender meat, and the classic Dhaka flavours worth gathering around.",
    image: "/food/kacchi-bhai.png",
    alt: "A serving of kacchi biryani",
    query: "kacchi",
  },
  {
    eyebrow: "Big burger energy",
    title: "Stacked, saucy, and seriously satisfying.",
    description:
      "Find loaded burgers and quick comfort food from popular kitchens near you.",
    image: "/food/chillox.png",
    alt: "A loaded cheeseburger",
    query: "burger",
  },
  {
    eyebrow: "Something sweet",
    title: "Finish your meal on a sweeter note.",
    description:
      "Traditional sweets, desserts, and little treats delivered when the craving arrives.",
    image: "/food/ambala.png",
    alt: "A selection of traditional sweets",
    query: "dessert",
  },
] as const;

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const slide = slides[activeSlide];

  useEffect(() => {
    if (isPaused) return;
    const interval = window.setInterval(
      () => setActiveSlide((current) => (current + 1) % slides.length),
      5500,
    );
    return () => window.clearInterval(interval);
  }, [isPaused]);

  function changeSlide(direction: -1 | 1) {
    setActiveSlide(
      (current) => (current + direction + slides.length) % slides.length,
    );
  }

  function exploreSlide() {
    showToast(
      slide.query ? `Showing the best ${slide.query} picks.` : "Opening all restaurants.",
      "info",
    );
    router.push(
      slide.query
        ? `/search?q=${encodeURIComponent(slide.query)}`
        : "/search",
    );
  }

  return (
    <section
      className="px-2 pt-5 sm:px-6 lg:px-14"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured food"
    >
      <div className="relative mx-auto grid min-h-[470px] max-w-[1500px] overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:grid-cols-[0.88fr_1.12fr]">
        <div className="relative z-10 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
            {slide.eyebrow}
          </p>
          <h1 className="mt-4 max-w-xl font-serif text-4xl font-bold leading-[1.04] tracking-tight text-foreground text-balance sm:text-5xl xl:text-6xl">
            {slide.title}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground text-pretty">
            {slide.description}
          </p>

          <div className="mt-7 max-w-xl">
            <SearchBar
              placeholder="Search for kacchi, burgers, coffees..."
              buttonLabel="Find food"
            />
          </div>

          <button
            type="button"
            onClick={exploreSlide}
            className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-bold text-primary transition hover:gap-3"
          >
            Explore this craving <ArrowRightIcon className="size-4" />
          </button>

          <div className="mt-9 flex items-center gap-2">
            {slides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Show slide ${index + 1}: ${item.eyebrow}`}
                aria-current={index === activeSlide ? "true" : undefined}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeSlide
                    ? "w-9 bg-primary"
                    : "w-4 bg-border hover:bg-primary/50"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative min-h-72 overflow-hidden lg:min-h-full">
          {slides.map((item, index) => (
            <Image
              key={item.image}
              src={item.image}
              alt={item.alt}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 56vw, 100vw"
              className={`object-cover transition duration-700 ease-out ${
                index === activeSlide ? "scale-100 opacity-100" : "scale-105 opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-card/25 via-transparent to-transparent lg:from-card/15" />
          <div className="absolute bottom-5 right-5 flex gap-2">
            <button
              type="button"
              onClick={() => changeSlide(-1)}
              aria-label="Previous slide"
              className="grid size-10 place-items-center rounded-full border border-white/40 bg-black/35 text-white backdrop-blur transition hover:bg-black/55"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => changeSlide(1)}
              aria-label="Next slide"
              className="grid size-10 place-items-center rounded-full border border-white/40 bg-black/35 text-white backdrop-blur transition hover:bg-black/55"
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
