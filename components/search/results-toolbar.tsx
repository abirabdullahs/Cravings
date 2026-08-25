"use client"

import { SelectControl } from "@/components/common/select-control"
import { Chip } from "@/components/common/chip"

export type SortKey = "recommended" | "top-rated" | "fastest" | "cheapest"

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "Recommended" },
  { key: "top-rated", label: "Top Rated" },
  { key: "fastest", label: "Fastest" },
  { key: "cheapest", label: "Cheapest" },
]

type ResultsToolbarProps = {
  cuisine: string
  cuisineOptions: { value: string; label: string }[]
  onCuisineChange: (value: string) => void
  area: string
  areaOptions: { value: string; label: string }[]
  onAreaChange: (value: string) => void
  sort: SortKey
  onSortChange: (value: SortKey) => void
}

export function ResultsToolbar({
  cuisine,
  cuisineOptions,
  onCuisineChange,
  area,
  areaOptions,
  onAreaChange,
  sort,
  onSortChange,
}: ResultsToolbarProps) {
  return (
    <div className="flex flex-col gap-5 border-y border-border py-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-3">
        <SelectControl
          label="Cuisine"
          value={cuisine}
          options={cuisineOptions}
          onChange={onCuisineChange}
        />
        <SelectControl
          label="Area"
          value={area}
          options={areaOptions}
          onChange={onAreaChange}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Sort by
        </span>
        {SORT_OPTIONS.map((option) => (
          <Chip
            key={option.key}
            variant="ghost"
            selected={sort === option.key}
            onClick={() => onSortChange(option.key)}
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </div>
  )
}
