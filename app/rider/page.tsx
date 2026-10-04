"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RiderGreeting } from "@/components/rider-dashboard/RiderGreeting";
import { StatsGrid } from "@/components/rider-dashboard/StatsGrid";
import { IncomingOrderCard } from "@/components/rider-dashboard/IncomingOrderCard";
import { TodaysSummaryCard } from "@/components/rider-dashboard/TodaysSummaryCard";
import { RiderReviewsCard } from "@/components/rider-dashboard/RiderReviewsCard";
import {
  useAvailableRequests,
  useRider,
  useRiderEarnings,
  useRiderProfile,
} from "@/hooks/useRider";

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export default function RiderDashboard() {
  const router = useRouter();
  const { data: profile, isLoading: isProfileLoading } = useRiderProfile();
  const riderCanReceiveOrders = profile?.status === "idle";
  const {
    data: requests,
    isLoading: isRequestsLoading,
    error: requestsError,
  } = useAvailableRequests(riderCanReceiveOrders);
  const { data: earnings, isLoading: isEarningsLoading } =
    useRiderEarnings(todayDateString());
  const { acceptRequest, isAccepting, setDutyStatus, isUpdatingDuty } =
    useRider();

  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  const [pendingDutyStatus, setPendingDutyStatus] = useState<
    "online" | "offline" | null
  >(null);

  const currentStatus: "online" | "offline" =
    profile?.status === "offline" ? "offline" : "online";

  async function handleDutyToggle(next: "online" | "offline") {
    if (next === currentStatus) return;
    setPendingDutyStatus(next);
    try {
      await setDutyStatus(next);
    } finally {
      setPendingDutyStatus(null);
    }
  }

  const visibleOpportunity = requests?.find(
    (request) => !dismissedIds.has(request.orderId),
  );

  if (isProfileLoading || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading your dashboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <RiderGreeting
          firstName={profile.name.split(" ")[0]}
          dutyStatus={currentStatus}
          busy={isUpdatingDuty || profile.status === "busy"}
          pendingStatus={pendingDutyStatus}
          onToggle={handleDutyToggle}
        />

        <div className="mt-8">
          <StatsGrid earnings={earnings} isLoading={isEarningsLoading} />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          {!riderCanReceiveOrders ? (
            <div className="flex items-center justify-center border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              {profile.status === "busy"
                ? "Complete your active delivery before accepting another order."
                : "You're offline. Go online to start receiving delivery opportunities."}
            </div>
          ) : isRequestsLoading ? (
            <div className="flex items-center justify-center border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Checking for incoming orders…
            </div>
          ) : requestsError ? (
            <div className="flex items-center justify-center border border-destructive/50 p-10 text-center text-sm text-destructive">
              {requestsError instanceof Error
                ? requestsError.message
                : "Your GPS location is required to find nearby orders."}
            </div>
          ) : visibleOpportunity ? (
            <IncomingOrderCard
              opportunity={visibleOpportunity}
              busy={isAccepting}
              onAccept={async () => {
                await acceptRequest(visibleOpportunity.orderId);
                router.push(`/rider/deliveries/active`);
              }}
              onDecline={() =>
                setDismissedIds((prev) =>
                  new Set(prev).add(visibleOpportunity.orderId),
                )
              }
            />
          ) : (
            <div className="flex items-center justify-center border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No nearby incoming orders right now — we will notify you when one
              comes in.
            </div>
          )}

          <TodaysSummaryCard
            earnings={earnings}
            isEarningsLoading={isEarningsLoading}
          />
        </div>

        <RiderReviewsCard />
      </main>
    </div>
  );
}
