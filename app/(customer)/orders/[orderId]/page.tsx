"use client";
import { useParams } from "next/navigation";
import { ActiveOrderView } from "@/components/tracking/ActiveOrderView";
import { useOrderReceipt, useOrderTracking } from "@/hooks/useDeliveryTracking";

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const {
    data: tracking,
    isLoading,
    isError,
  } = useOrderTracking(Number(orderId));
  const { data: receiptItems = [] } = useOrderReceipt(Number(orderId));

  if (isLoading) {
    return (
      <p className="p-10 text-center text-sm text-muted-foreground">Loading…</p>
    );
  }

  if (isError || !tracking) {
    return (
      <div className="mx-auto max-w-3xl p-10 text-center text-sm text-muted-foreground">
        We couldn&apos;t find that order, or it isn&apos;t linked to your
        account.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <ActiveOrderView
        viewer="customer"
        tracking={tracking}
        receiptItems={receiptItems}
      />
    </div>
  );
}
