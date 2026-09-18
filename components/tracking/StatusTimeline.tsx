import { Check } from "lucide-react";
import { DELIVERY_STEPS } from "@/types/delivery-tracking";

export interface TimelineStep {
  key: string;
  label: string;
}

interface StatusTimelineProps {
  currentStatus: string;
  steps?: TimelineStep[];
}

export function StatusTimeline({
  currentStatus,
  steps = DELIVERY_STEPS,
}: StatusTimelineProps) {
  const currentIndex = steps.findIndex((step) => step.key === currentStatus);
  const isAllDelivered = currentStatus === "delivered";

  return (
    <ol className="space-y-3">
      {steps.map((step, index) => {
        // Mark as done if step index is behind current status OR if overall state is delivered
        const isDone = isAllDelivered || index < currentIndex;
        const isCurrent = !isAllDelivered && index === currentIndex;

        return (
          <li key={step.key} className="flex items-center gap-3">
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                isDone
                  ? "bg-emerald-600 text-white"
                  : isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground"
              }`}
            >
              {isDone ? <Check className="size-4" /> : index + 1}
            </span>
            <span
              className={`text-sm font-semibold ${
                isDone
                  ? "text-foreground"
                  : isCurrent
                    ? "text-primary"
                    : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
