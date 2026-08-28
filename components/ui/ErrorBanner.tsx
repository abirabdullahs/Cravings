import { X } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-6 flex items-center justify-between border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      <span>{message}</span>
      <button aria-label="Dismiss error" onClick={onDismiss}>
        <X className="size-4" />
      </button>
    </div>
  );
}
