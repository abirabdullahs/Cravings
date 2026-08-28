"use client";

import Image from "next/image";
import { PlusIcon } from "lucide-react";
import type { MenuItem } from "@/types/restaurant";

type RestaurantMenuSectionProps = {
  title: string;
  items: MenuItem[];
  onAdd: (item: MenuItem) => void;
};

export function RestaurantMenuSection({
  title,
  items,
  onAdd,
}: RestaurantMenuSectionProps) {
  return (
    <section aria-labelledby={title.replace(/\s+/g, "-").toLowerCase()}>
      <h2
        id={title.replace(/\s+/g, "-").toLowerCase()}
        className="border-b border-border pb-3 font-serif text-2xl font-bold text-foreground"
      >
        {title}
      </h2>
      <div className="grid gap-4 pt-5 sm:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden border border-border bg-card"
          >
            {item.imageUrl && (
              <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <h3 className="font-serif text-base font-bold text-foreground">
                  {item.name}
                </h3>
                <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                  {item.description || "No description available."}
                </p>
                <p className="mt-3 text-sm font-semibold text-foreground">
                  ৳{item.price}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onAdd(item)}
                className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-primary bg-card px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <PlusIcon className="size-3.5" aria-hidden="true" />
                Add
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
