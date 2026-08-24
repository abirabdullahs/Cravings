"use client"

import { useState } from "react"
import { CUISINES } from "@/lib/restaurants"
import { SectionHeading } from "@/components/common/section-heading"
import { Chip } from "@/components/common/chip"

export function CuisineBrowser() {
  const [active, setActive] = useState("all")

  return (
    <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <SectionHeading title="Browse by cuisine" as="h2" />
      <div className="mt-5 flex flex-wrap gap-2.5">
        {CUISINES.map((cuisine) => (
          <Chip
            key={cuisine.key}
            selected={active === cuisine.key}
            onClick={() => setActive(cuisine.key)}
          >
            {cuisine.label}
          </Chip>
        ))}
      </div>
    </section>
  )
}
