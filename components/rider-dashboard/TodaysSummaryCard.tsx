import type { RiderEarningsSummary } from "@/types/rider";

interface TodaysSummaryCardProps {
  earnings: RiderEarningsSummary | undefined;
  isLoading: boolean;
}

// NOTE: replaces the old per-row ActivityTable ("#CRV-2840, Kacchi Bhai,
// Banani, ৳65"...). No query returns individual completed deliveries —
// GET_RIDER_EARNINGS_BY_DATE only returns the aggregate (count + total).
// A real activity list needs a new query joining deliveries + orders +
// restaurants for rider_id = $1 AND status = 'delivered' AND date = today.
// Flagging rather than inventing rows here.
export function TodaysSummaryCard({ earnings, isLoading }: TodaysSummaryCardProps) {
  const totalDeliveries = earnings?.totalDeliveries ?? 0;
  const totalIncome = earnings?.totalIncome ?? 0;

  return (
    <div className="border border-border bg-card p-6">
      <h3 className="font-serif text-2xl font-bold text-foreground">Today&apos;s Activity</h3>

      {isLoading ? (
        <p className="mt-5 text-sm text-muted-foreground">Loading…</p>
      ) : totalDeliveries > 0 ? (
        <p className="mt-5 text-sm text-foreground">
          You&apos;ve completed <span className="font-semibold">{totalDeliveries}</span>{" "}
          {totalDeliveries === 1 ? "delivery" : "deliveries"} today, earning{" "}
          <span className="font-semibold text-primary">৳{Number(totalIncome).toLocaleString()}</span>{" "}
          in delivery fees.
        </p>
      ) : (
        <div className="mt-5 border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
          No completed deliveries yet today.
        </div>
      )}

      <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
        A detailed per-order activity list is coming once the backend has a query for it.
      </p>
    </div>
  );
}
