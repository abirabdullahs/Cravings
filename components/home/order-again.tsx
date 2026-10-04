"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, RotateCcwIcon, ShoppingBagIcon } from "lucide-react";
import { useOrderHistory, useReorder } from "@/hooks/useOrder";
import { SectionHeading } from "@/components/common/section-heading";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/components/ui/toast-provider";
import { toErrorMessage } from "@/lib/http";

const repeatableStatuses = new Set(["delivered", "cancelled"]);

function OrderAgainSkeleton() {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3" aria-label="Loading previous orders">
      {[1, 2, 3].map((item) => (
        <div key={item} className="animate-pulse rounded-lg border border-border bg-card p-5">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="mt-4 h-6 w-3/4 rounded bg-muted" />
          <div className="mt-3 h-4 w-1/2 rounded bg-muted" />
          <div className="mt-6 h-10 rounded bg-muted" />
        </div>
      ))}
      <span className="sr-only">Loading previous orders</span>
    </div>
  );
}

export function OrderAgain() {
  const { status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const { data: orders = [], isLoading, isError } = useOrderHistory(
    status === "authenticated",
  );
  const { reorder, isReordering, reorderingOrderId } = useReorder();
  const previousOrders = orders
    .filter((order) => repeatableStatuses.has(order.orderStatus))
    .slice(0, 3);

  if (status === "unauthenticated") return null;

  async function handleReorder(orderId: number, restaurantName: string) {
    try {
      const result = await reorder(orderId);
      showToast(
        `${result.addedItems} item${result.addedItems === 1 ? "" : "s"} from ${restaurantName} added to your cart.`,
        "success",
      );
      router.push(`/cart/${result.cartId}`);
    } catch (error) {
      showToast(
        toErrorMessage(error, "Could not add this order to your cart."),
        "error",
      );
    }
  }

  return (
    <section className="px-2 pt-12 sm:px-6 lg:px-14">
      <div className="mx-auto max-w-[1500px]">
        <SectionHeading
          title="Order again"
          as="h2"
          action={{ label: "Order history", href: "/orders" }}
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Your recent favourites, ready for another round.
        </p>

        {status === "loading" || isLoading ? (
          <OrderAgainSkeleton />
        ) : isError ? (
          <div className="mt-6 rounded-lg border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
            We could not load your previous orders right now.
          </div>
        ) : previousOrders.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {previousOrders.map((order) => {
              const isThisOrderLoading =
                isReordering && reorderingOrderId === order.id;
              return (
                <article
                  key={order.id}
                  className="group flex flex-col rounded-lg border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                        Last ordered {new Date(order.createdAt).toLocaleDateString("en-BD", { month: "short", day: "numeric" })}
                      </p>
                      <h3 className="mt-2 font-serif text-xl font-bold text-foreground">
                        {order.restaurantName}
                      </h3>
                    </div>
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                      <RotateCcwIcon className="size-4" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {order.totalItems} item{order.totalItems === 1 ? "" : "s"} · ৳{order.totalAmount}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleReorder(order.id, order.restaurantName)}
                    disabled={isReordering}
                    className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isThisOrderLoading ? (
                      <LoadingSpinner label="Adding to cart…" />
                    ) : (
                      <>
                        <ShoppingBagIcon className="size-4" aria-hidden="true" />
                        Order again
                      </>
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-lg border border-dashed border-border bg-card/60 p-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">No repeat cravings yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Your completed orders will appear here.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                showToast("Let’s find your first favourite.");
                router.push("/search");
              }}
              className="inline-flex items-center gap-2 text-sm font-bold text-primary"
            >
              Browse restaurants <ArrowRightIcon className="size-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
