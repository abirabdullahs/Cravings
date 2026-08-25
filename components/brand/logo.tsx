import Link from "next/link"
import { cn } from "@/lib/utils"

type LogoProps = {
  /** "default" for light backgrounds, "inverted" for the dark footer */
  variant?: "default" | "inverted"
  className?: string
  href?: string
}

const sizes = {
  default: "text-2xl",
  inverted: "text-3xl",
}

export function Logo({ variant = "default", className, href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "font-serif font-bold tracking-tight text-primary",
        sizes[variant],
        className,
      )}
    >
      Cravings<span className="text-primary/70">.</span>
    </Link>
  )
}
