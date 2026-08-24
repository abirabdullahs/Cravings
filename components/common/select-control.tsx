"use client"

import { ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Option = { value: string; label: string }

type SelectControlProps = {
  label: string
  value: string
  options: Option[]
  onChange?: (value: string) => void
  className?: string
}

export function SelectControl({
  label,
  value,
  options,
  onChange,
  className,
}: SelectControlProps) {
  return (
    <label
      className={cn(
        "group relative flex min-w-40 flex-col rounded-md border border-border bg-card px-3 py-2 text-left transition-colors focus-within:border-primary/60",
        className,
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent pr-6 text-sm font-medium text-foreground outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        className="pointer-events-none absolute bottom-3 right-3 size-4 text-muted-foreground"
        aria-hidden="true"
      />
    </label>
  )
}
