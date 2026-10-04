"use client";

import { useParams } from "next/navigation";
import { ActiveOrderView } from "@/components/tracking/ActiveOrderView";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useOrderTracking } from "@/hooks/useDeliveryTracking";
import { useCancelOrder, useOrderDetail } from "@/hooks/useOrder";

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const {
    data: tracking,
    isLoading,
    isError,
  } = useOrderTracking(Number(orderId));
  const { data: receipt } = useOrderDetail(Number(orderId));
  const { cancelOrder, isCancelling } = useCancelOrder(Number(orderId));

  if (isLoading) {
    return (
      <div className="flex justify-center p-10 text-sm text-primary">
        <LoadingSpinner label="Loading order…" />
      </div>
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
    <div className="mx-auto px-2 pb-16 pt-8 sm:px-14">
      <ActiveOrderView
        viewer="customer"
        tracking={tracking}
        receipt={receipt}
        onCancel={async () => {
          if (!window.confirm("Cancel this order? This cannot be undone."))
            return;
          await cancelOrder();
        }}
        isCancelling={isCancelling}
      />
    </div>
  );
}
