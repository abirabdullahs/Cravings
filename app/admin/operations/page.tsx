"use client";

import { useEffect, useState } from "react";
import { RoleRequestsTable } from "@/components/admin/RoleRequestsTable";
import type { Restaurant, Rider, ReviewRequest } from "@/types/admin-types";
import { apiRequest, toErrorMessage } from "@/lib/http";

const PAGE_SIZE = 10;

function ListPager({ page, total, onPage }: { page: number; total: number; onPage: (page: number) => void }) {
  const pages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  if (total <= PAGE_SIZE) return null;
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs">
      <span className="text-muted-foreground">Page {page} of {pages}</span>
      <div className="flex gap-2">
        <button type="button" disabled={page === 1} onClick={() => onPage(page - 1)} className="border border-border px-2 py-1 disabled:opacity-50">Previous</button>
        <button type="button" disabled={page === pages} onClick={() => onPage(page + 1)} className="border border-border px-2 py-1 disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}

export default function AdminOperationsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [restaurantPage, setRestaurantPage] = useState(1);
  const [riderPage, setRiderPage] = useState(1);
  const [requestPage, setRequestPage] = useState(1);

  const visibleRestaurants = restaurants.slice((restaurantPage - 1) * PAGE_SIZE, restaurantPage * PAGE_SIZE);
  const visibleRiders = riders.slice((riderPage - 1) * PAGE_SIZE, riderPage * PAGE_SIZE);
  const visibleRequests = requests.slice((requestPage - 1) * PAGE_SIZE, requestPage * PAGE_SIZE);

  useEffect(() => {
    async function load() {
      try {
        const responses = await Promise.all([
          fetch("/api/admin/restaurants"),
          fetch("/api/admin/riders"),
          fetch("/api/admin/requests"),
        ]);
        if (!responses.every((response) => response.ok))
          throw new Error("Could not load operations");
        setRestaurants((await responses[0].json()).restaurants ?? []);
        setRiders((await responses[1].json()).riders ?? []);
        setRequests((await responses[2].json()).requests ?? []);
        setRestaurantPage(1);
        setRiderPage(1);
        setRequestPage(1);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load operations",
        );
      }
    }
    void load();
  }, []);

  async function updateRestaurant(restaurant: Restaurant) {
    setError("");
    setPendingAction(`restaurant-${restaurant.id}`);
    try {
      const payload = await apiRequest<{ restaurant: Restaurant }>(
        "/api/admin/restaurants",
        {
          method: "PATCH",
          body: JSON.stringify({
            restaurantId: restaurant.id,
            activeStatus: !restaurant.active_status,
          }),
        },
      );
      setRestaurants((current) =>
        current.map((item) =>
          item.id === restaurant.id
            ? { ...item, active_status: payload.restaurant.active_status }
            : item,
        ),
      );
    } catch (updateError) {
      setError(toErrorMessage(updateError, "Could not update restaurant"));
    } finally {
      setPendingAction(null);
    }
  }

  async function updateRider(riderId: number, status: Rider["status"]) {
    setError("");
    setPendingAction(`rider-${riderId}`);
    try {
      const payload = await apiRequest<{ rider: Rider }>(
        "/api/admin/riders",
        {
          method: "PATCH",
          body: JSON.stringify({ riderId, status }),
        },
      );
      setRiders((current) =>
        current.map((item) =>
          item.id === riderId
            ? { ...item, status: payload.rider.status }
            : item,
        ),
      );
    } catch (updateError) {
      setError(toErrorMessage(updateError, "Could not update rider"));
    } finally {
      setPendingAction(null);
    }
  }

  async function reviewRequest(
    requestId: number,
    status: "APPROVED" | "REJECTED",
    rejectionReason?: string,
  ) {
    setError("");
    setPendingAction(`request-${requestId}`);
    try {
      const payload = await apiRequest<{ request: ReviewRequest }>(
        "/api/admin/requests",
        {
          method: "POST",
          body: JSON.stringify({
            requestId,
            status,
            reviewNote: "Reviewed by admin",
            rejectionReason: status === "REJECTED" ? rejectionReason : "",
          }),
        },
      );
      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? { ...request, ...payload.request }
            : request,
        ),
      );
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
          Manage restaurant availability, rider status, and partner
          applications.
        </p>
      </header>
      {error && (
        <p className="mb-6 border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="mb-4 font-serif text-2xl font-bold">Restaurants</h2>
          <div className="overflow-x-auto border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="px-4 py-3">Restaurant</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRestaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="border-b border-border">
                    <td className="px-4 py-4">
                      <strong>{restaurant.name}</strong>
                      <span className="block text-xs text-muted-foreground">
                        {restaurant.address}
                      </span>
                    </td>
                    <td className="px-4 py-4">{restaurant.owner_name}</td>
                    <td className="px-4 py-4">
                      {restaurant.active_status ? "Active" : "Inactive"}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => void updateRestaurant(restaurant)}
                        disabled={pendingAction !== null}
                        className="text-xs font-bold text-primary disabled:opacity-50"
                      >
                        {restaurant.active_status ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ListPager page={restaurantPage} total={restaurants.length} onPage={setRestaurantPage} />
          </div>
        </section>
        <section>
          <h2 className="mb-4 font-serif text-2xl font-bold">Riders</h2>
          <div className="border border-border bg-card">
            {visibleRiders.map((rider) => (
              <div
                key={rider.id}
                className="border-b border-border p-4 text-sm"
              >
                <div className="flex justify-between gap-3">
                  <strong>{rider.name}</strong>
                  <select
                    value={rider.status}
                    disabled={pendingAction !== null}
                    onChange={(event) =>
                      void updateRider(
                        rider.id,
                        event.target.value as Rider["status"],
                      )
                    }
                    className="border border-border bg-background px-2 py-1 text-xs"
                  >
                    <option value="offline">Offline</option>
                    <option value="idle">Available</option>
                    <option value="busy">Busy</option>
                  </select>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {rider.phone || "No phone"} · {rider.vehicle_type} ·{" "}
                  {rider.vehicle_number}
                </p>
              </div>
            ))}
            <ListPager page={riderPage} total={riders.length} onPage={setRiderPage} />
          </div>
        </section>
      </div>
      <RoleRequestsTable
        requests={visibleRequests}
        onReview={(id, status, rejectionReason) =>
          void reviewRequest(id, status, rejectionReason)
        }
        disabled={pendingAction !== null}
      />
      <ListPager page={requestPage} total={requests.length} onPage={setRequestPage} />
    </div>
  );
}
