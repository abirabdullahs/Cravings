import { Bike, Coins } from "lucide-react";
import type { RiderEarningsSummary } from "@/types/rider";

interface StatsGridProps {
  earnings: RiderEarningsSummary | undefined;
  isLoading: boolean;
}

function StatCard({
  icon,
  label,
  value,
  caption,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="flex size-8 items-center justify-center rounded-md bg-secondary text-primary">
          {icon}
        </div>
      </div>
      <p className="mt-3 font-serif text-3xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}

// NOTE: rating, acceptance rate, tips, and a bonus target were in the
// original mockup but none of those exist in the schema or any query —
// riders has no rating/acceptance_rate columns. Dropping those two cards
// rather than showing fabricated numbers. Re-add once those columns (or
// a computed query) exist.
export function StatsGrid({ earnings, isLoading }: StatsGridProps) {
  const totalIncome = earnings?.totalIncome ?? 0;
  const totalDeliveries = earnings?.totalDeliveries ?? 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard
        icon={<Coins className="size-4" />}
        label="Today's earnings"
        value={isLoading ? "…" : `৳${Number(totalIncome).toLocaleString()}`}
        caption="Delivery fees from completed runs today"
      />
      <StatCard
        icon={<Bike className="size-4" />}
        label="Completed runs"
        value={isLoading ? "…" : `${totalDeliveries} Deliveries`}
        caption="Based on delivered orders today"
      />
    </div>
  );
}
