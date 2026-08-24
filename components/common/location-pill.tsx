import { MapPinIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function LocationPill({
  location = "Dhaka",
  className,
}: {
  location?: string
  className?: string
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40",
        className,
      )}
    >
      <MapPinIcon className="size-4 text-primary" aria-hidden="true" />
      {location}
    </button>
  )
}
