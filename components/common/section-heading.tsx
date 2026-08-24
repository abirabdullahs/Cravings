import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  title: string
  action?: { label: string; href: string }
  className?: string
  as?: "h2" | "h3"
}

export function SectionHeading({
  title,
  action,
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <Tag className="font-serif text-2xl font-bold tracking-tight text-foreground text-balance">
        {title}
      </Tag>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          {action.label}
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  )
}
