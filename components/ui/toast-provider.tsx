"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CheckCircle2Icon, CircleAlertIcon, InfoIcon, XIcon } from "lucide-react";

type ToastTone = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: () => void }) {
  useEffect(() => {
    const timeout = window.setTimeout(dismiss, 3200);
    return () => window.clearTimeout(timeout);
  }, [dismiss]);

  const Icon =
    toast.tone === "success"
      ? CheckCircle2Icon
      : toast.tone === "error"
        ? CircleAlertIcon
        : InfoIcon;

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className="flex w-full items-start gap-3 rounded-md border border-border bg-card p-4 text-foreground shadow-lg"
    >
      <Icon
        className={`mt-0.5 size-5 shrink-0 ${
          toast.tone === "success"
            ? "text-emerald-700"
            : toast.tone === "error"
              ? "text-destructive"
              : "text-primary"
        }`}
        aria-hidden="true"
      />
      <p className="flex-1 text-sm font-medium leading-5">{toast.message}</p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="rounded-sm p-0.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
      >
        <XIcon className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-20 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem
              toast={toast}
              dismiss={() =>
                setToasts((current) => current.filter((item) => item.id !== toast.id))
              }
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
