"use client";

import { useEffect, useState } from "react";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { RoleRequestsTable } from "@/components/admin/RoleRequestsTable";
import type { Restaurant, Rider, ReviewRequest } from "@/types/admin-types";
import { apiRequest, toErrorMessage } from "@/lib/http";

const PAGE_SIZE = 10;
type OperationsSection = "restaurants" | "riders" | "approvals";

export default function AdminOperationsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [activeSection, setActiveSection] =
    useState<OperationsSection>("approvals");
  const [restaurantPage, setRestaurantPage] = useState(1);
  const [riderPage, setRiderPage] = useState(1);
  const [requestPage, setRequestPage] = useState(1);
  const [restaurantTotal, setRestaurantTotal] = useState(0);
  const [riderTotal, setRiderTotal] = useState(0);
  const [requestTotal, setRequestTotal] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const responses = await Promise.all([
          fetch(
            `/api/admin/restaurants?page=${restaurantPage}&limit=${PAGE_SIZE}`,
          ),
          fetch(`/api/admin/riders?page=${riderPage}&limit=${PAGE_SIZE}`),
          fetch(
            `/api/admin/requests?status=PENDING&page=${requestPage}&limit=${PAGE_SIZE}`,
          ),
        ]);
        if (!responses.every((response) => response.ok)) {
          throw new Error("Could not load operations");
        }

        const [restaurantPayload, riderPayload, requestPayload] =
          await Promise.all(responses.map((response) => response.json()));
        setRestaurants(restaurantPayload.restaurants ?? []);
        setRestaurantTotal(Number(restaurantPayload.total ?? 0));
        setRiders(riderPayload.riders ?? []);
        setRiderTotal(Number(riderPayload.total ?? 0));
        setRequests(requestPayload.requests ?? []);
        setRequestTotal(Number(requestPayload.total ?? 0));
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load operations",
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [restaurantPage, riderPage, requestPage]);

  async function reviewRequest(
    requestId: number,
    status: "APPROVED" | "REJECTED",
    rejectionReason?: string,
  ) {
    setError("");
    setPendingAction(`request-${requestId}-${status}`);
    try {
      await apiRequest<{ request: ReviewRequest }>("/api/admin/requests", {
        method: "POST",
        body: JSON.stringify({
          requestId,
          status,
          reviewNote: "Reviewed by admin",
          rejectionReason: status === "REJECTED" ? rejectionReason : "",
        }),
      });
      setRequests((current) =>
        current.filter((request) => request.id !== requestId),
      );
      setRequestTotal((current) => Math.max(current - 1, 0));
    } catch (reviewError) {
      setError(toErrorMessage(reviewError, "Could not review request"));
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          Admin operations
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold">
          Partners and approvals
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Monitor partner availability and review new applications.
        </p>
      </header>

      {error && (
        <p className="mb-6 border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4">
        {([
          ["approvals", `Approvals (${requestTotal})`],
          ["restaurants", `Restaurants (${restaurantTotal})`],
          ["riders", `Riders (${riderTotal})`],
        ] as Array<[OperationsSection, string]>).map(([section, label]) => (
          <button
            key={section}
            type="button"
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 text-sm font-semibold ${
              activeSection === section
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeSection === "restaurants" && (
        <section>
          <div className="mb-4">
            <h2 className="font-serif text-2xl font-bold">Restaurants</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Availability is read-only here and controlled by restaurant owners.
            </p>
          </div>
          <div className="overflow-x-auto border border-border bg-card">
            <table className="w-full min-w-180 text-left text-sm">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="px-4 py-3">Restaurant</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="border-b border-border">
                    <td className="px-4 py-4">
                      <strong>{restaurant.name}</strong>
                      <span className="block text-xs text-muted-foreground">
                        {restaurant.address}
                      </span>
                    </td>
                    <td className="px-4 py-4">{restaurant.owner_name}</td>
                    <td className="px-4 py-4">{restaurant.product_count}</td>
                    <td className="px-4 py-4">{restaurant.order_count}</td>
                    <td className="px-4 py-4">
                      {restaurant.active_status ? "Active" : "Inactive"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <AdminPagination
              page={restaurantPage}
              total={restaurantTotal}
              pageSize={PAGE_SIZE}
              onPage={setRestaurantPage}
              disabled={loading}
            />
          </div>
        </section>
      )}

      {activeSection === "riders" && (
        <section>
          <div className="mb-4">
            <h2 className="font-serif text-2xl font-bold">Riders</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Duty status is controlled by each rider and their active delivery.
            </p>
          </div>
          <div className="border border-border bg-card">
            {riders.map((rider) => (
              <div key={rider.id} className="border-b border-border p-4 text-sm">
                <div className="flex justify-between gap-3">
                  <strong>{rider.name}</strong>
                  <span className="border border-border bg-background px-2 py-1 text-xs capitalize">
                    {rider.status === "idle" ? "Available" : rider.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {rider.phone || "No phone"} · {rider.vehicle_type} ·{" "}
                  {rider.vehicle_number}
                </p>
              </div>
            ))}
            <AdminPagination
              page={riderPage}
              total={riderTotal}
              pageSize={PAGE_SIZE}
              onPage={setRiderPage}
              disabled={loading}
            />
          </div>
        </section>
      )}

      {activeSection === "approvals" && (
        <div>
          {!loading && !requests.length && (
            <p className="border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No pending partner applications.
            </p>
          )}
          <RoleRequestsTable
            requests={requests}
            onReview={(id, status, rejectionReason) =>
              void reviewRequest(id, status, rejectionReason)
            }
            disabled={pendingAction !== null}
            pendingAction={pendingAction}
            total={requestTotal}
          />
          <AdminPagination
            page={requestPage}
            total={requestTotal}
            pageSize={PAGE_SIZE}
            onPage={setRequestPage}
            disabled={loading}
          />
        </div>
      )}
    </div>
  );
}
