"use client";

import Link from "next/link";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useOrderHistory } from "@/hooks/useOrder";

const finishedStatuses = new Set(["delivered", "cancelled"]);

export function ActiveOrderBanner() {
  const { status: sessionStatus } = useSession();
  const { data: orders = [], isLoading } = useOrderHistory(
    sessionStatus === "authenticated",
  );
  const activeOrder = orders.find(
    (order) => !finishedStatuses.has(order.orderStatus),
  );

  if (sessionStatus !== "authenticated" || isLoading || !activeOrder) {
    return null;
  }

  const statusLabel = activeOrder.orderStatus.replaceAll("_", " ");

  return (
    <section className="border-y border-primary/25 bg-primary/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <ClockIcon className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-bold text-foreground">
              Ongoing order #{activeOrder.id} from {activeOrder.restaurantName}
            </p>
            <p className="mt-0.5 text-xs capitalize text-muted-foreground">
              Current status: {statusLabel}
            </p>
          </div>
        </div>
        <Link
          href={`/orders/${activeOrder.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          Track order <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </section>
  );
}
