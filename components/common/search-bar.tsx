"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type SearchBarProps = {
  defaultValue?: string
  placeholder?: string
  className?: string
  /** Optional trailing submit button label (e.g. hero "Find food") */
  buttonLabel?: string
}

export function SearchBar({
  defaultValue = "",
  placeholder = "Search restaurants or dishes...",
  className,
  buttonLabel,
}: SearchBarProps) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center gap-2 rounded-sm border border-border bg-card pl-3 transition-colors focus-within:border-primary/60",
        buttonLabel ? "p-1.5 pl-4" : "px-3 py-2",
        className,
      )}
    >
      <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none"
      />
      {buttonLabel ? (
        <button
          type="submit"
          className="shrink-0 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {buttonLabel}
        </button>
      ) : null}
    </form>
  )
}
