"use client";
import { useRouter } from "next/navigation";
import { ActiveOrderView } from "@/components/tracking/ActiveOrderView";
import {
  useActiveDelivery,
  useAdvanceDelivery,
} from "@/hooks/useDeliveryTracking";
import type { DeliveryStep } from "@/types/delivery-tracking";

export default function RiderActiveOrderPage() {
  const router = useRouter();
  const { data: tracking, isLoading } = useActiveDelivery();
  const { advance, isAdvancing } = useAdvanceDelivery(tracking?.orderId ?? 0);

  async function handleAdvance(nextStatus: DeliveryStep) {
    await advance(nextStatus);
    if (nextStatus === "delivered") router.replace("/rider");
  }

  if (isLoading) {
    return (
      <p className="p-10 text-center text-sm text-muted-foreground">Loading…</p>
    );
  }

  if (!tracking) {
    return (
      <div className="mx-auto max-w-3xl p-10 text-center text-sm text-muted-foreground">
        You don&apos;t have an active order right now. Go online from your
        dashboard to start receiving delivery opportunities.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <ActiveOrderView
        viewer="rider"
        tracking={tracking}
        onAdvance={handleAdvance}
        isAdvancing={isAdvancing}
      />
    </div>
  );
}
