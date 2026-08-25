import { StarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type RatingProps = {
  value: number
  className?: string
}

export function Rating({ value, className }: RatingProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-serif text-sm font-medium italic text-star",
        className,
      )}
    >
      {value}
      <StarIcon className="size-3.5 fill-star stroke-star not-italic" aria-hidden="true" />
    </span>
  )
}
