// app/rider/deliveries/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRiderDeliveries } from "@/hooks/useRider";
import { TodaysSummaryCard } from "@/components/rider-dashboard/TodaysSummaryCard";
import {
  MapPin,
  Store,
  Clock,
  ChevronRight,
  PackageCheck,
  AlertCircle,
} from "lucide-react";

type FilterTab = "all" | "cancelled" | "delivered";

export default function RiderDeliveriesPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const {
    data: deliveries,
    isLoading,
    isError,
    refetch,
  } = useRiderDeliveries();

  // Client-side filtering logic
  const filteredDeliveries = deliveries?.filter((delivery) => {
    const status = (
      delivery.deliveryStatus ||
      ""
    ).toLowerCase();

    if (activeTab === "cancelled") {
      return status === "cancelled";
    }
    if (activeTab === "delivered") {
      return status === "delivered";
    }
    return true; // "all"
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          Deliveries Dashboard
        </h1>
        <p className="text-s text-muted-foreground">
          Manage your assigned tasks and review past activity.
        </p>
      </div>

      
      {/* Deliveries List Section */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border">
          {(["all", "cancelled", "delivered"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-s font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-32 animate-pulse border border-border bg-muted/40"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center border border-destructive/20 bg-destructive/5 p-8 text-center">
            <AlertCircle className="size-8 text-destructive mb-2" />
            <p className="text-s font-semibold text-destructive">
              Failed to load deliveries
            </p>
            <button
              onClick={() => refetch()}
              className="mt-3 border border-border bg-background px-3 py-1.5 text-s font-semibold text-foreground hover:bg-muted"
            >
              Retry
            </button>
          </div>
        ) : !filteredDeliveries || filteredDeliveries.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border p-12 text-center text-muted-foreground">
            <PackageCheck className="size-10 mb-2 stroke-1" />
            <p className="text-s">
              No {activeTab !== "all" ? activeTab : ""} deliveries found.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDeliveries.map((delivery) => {
              const statusStr =
                delivery.deliveryStatus ||  "";
              const isDelivered = statusStr.toLowerCase() === "delivered";

              return (
                <div
                  key={delivery.deliveryId}
                  className="group border border-border bg-card p-4 transition-all hover:border-primary/50"
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-s font-bold text-foreground">
                        Order #{delivery.orderId}
                      </span>
                      <span className="text-s text-muted-foreground">
                        (৳{Number(delivery.totalAmount).toFixed(0)})
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isDelivered
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {statusStr.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex justify-between my-3 gap-2 text-s">
                    <div className="flex items-start gap-2 text-foreground">
                      <Store className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">
                          {delivery.restaurantName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {delivery.restaurantAddress}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-foreground">
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span className="line-clamp-1">
                        {delivery.dropoffAddress}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-border/50 text-[11px]">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Clock className="size-3" />
                      Assigned:{" "}
                      {new Date(delivery.assignedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {/* <Link
                      href={`/rider/deliveries/${delivery.orderId}`}
                      className="inline-flex items-center gap-1 text-s font-semibold text-primary hover:underline"
                    >
                      View Details{" "}
                      <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                    </Link> */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
