"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RiderGreeting } from "@/components/rider-dashboard/RiderGreeting";
import { StatsGrid } from "@/components/rider-dashboard/StatsGrid";
import { IncomingOrderCard } from "@/components/rider-dashboard/IncomingOrderCard";
import { TodaysSummaryCard } from "@/components/rider-dashboard/TodaysSummaryCard";
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
  const { data: requests, isLoading: isRequestsLoading } =
    useAvailableRequests();
  const { data: earnings, isLoading: isEarningsLoading } =
    useRiderEarnings(todayDateString());
  const { acceptRequest, isAccepting, setDutyStatus, isUpdatingDuty } =
    useRider();

  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());

  const currentStatus: "online" | "offline" =
    profile?.status === "offline" ? "offline" : "online";

  async function handleDutyToggle(next: "online" | "offline") {
    if (next === currentStatus) return;
    await setDutyStatus(next);
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
          busy={isUpdatingDuty}
          onToggle={handleDutyToggle}
        />

        <div className="mt-8">
          <StatsGrid earnings={earnings} isLoading={isEarningsLoading} />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          {isRequestsLoading ? (
            <div className="flex items-center justify-center border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Checking for incoming orders…
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
              {currentStatus === "online"
                ? "No incoming orders right now — we'll notify you the moment one comes in."
                : "You're offline. Go online to start receiving delivery opportunities."}
            </div>
          )}

          <TodaysSummaryCard
            earnings={earnings}
            isEarningsLoading={isEarningsLoading}
          />
        </div>
      </main>
    </div>
  );
}
