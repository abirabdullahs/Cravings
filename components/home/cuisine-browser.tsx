"use client";

import { useRouter } from "next/navigation";
import { CUISINES } from "@/lib/restaurants";
import { SectionHeading } from "@/components/common/section-heading";
import { Chip } from "@/components/common/chip";
import { useToast } from "@/components/ui/toast-provider";

export function CuisineBrowser() {
  const router = useRouter();
  const { showToast } = useToast();

  function browseCuisine(key: string, label: string) {
    showToast(`Opening ${label.toLowerCase()} picks.`);
    router.push(
      key === "all" ? "/search" : `/search?cuisine=${encodeURIComponent(key)}`,
    );
  }

  return (
    <section className="mx-auto max-w-[1500px] px-2 pt-12 sm:px-6 lg:px-14">
      <SectionHeading title="Browse by cuisine" as="h2" />
      <div className="mt-5 flex flex-wrap gap-2.5">
        {CUISINES.map((cuisine) => (
          <Chip
            key={cuisine.key}
            onClick={() => browseCuisine(cuisine.key, cuisine.label)}
          >
            {cuisine.label}
          </Chip>
        ))}
      </div>
    </section>
  );
}
