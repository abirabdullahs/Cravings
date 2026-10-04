import { LoaderCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({
  label = "Loading",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      role="status"
      className={cn("inline-flex items-center gap-2", className)}
    >
      <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
