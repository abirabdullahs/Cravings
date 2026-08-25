"use client"

import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean
  /** "outline" = bordered pills (cuisine browser); "ghost" = text pills (sort by) */
  variant?: "outline" | "ghost"
}

export function Chip({
  selected = false,
  variant = "outline",
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variant === "outline" &&
          "border px-4 py-2 " +
            (selected
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-foreground hover:border-primary/40 hover:text-primary"),
        variant === "ghost" &&
          "border px-4 py-2 " +
            (selected
              ? "border-border bg-card text-primary shadow-sm"
              : "border-transparent bg-transparent text-muted-foreground hover:text-foreground"),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
