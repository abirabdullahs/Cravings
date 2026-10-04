"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UploadButton } from "@/lib/uploadthing";
import {
  useNotifications,
  useMarkNotificationRead,
} from "@/hooks/useNotifications";
import type { Restaurant } from "@/types/restaurant";
import type { Coupon } from "@/types/order";
import { apiRequest, toErrorMessage } from "@/lib/http";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type Role = "admin" | "owner" | "rider" | "customer";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  phone: string;
  profile_image?: string | null;
  role: Role;
  created_at: string;
  account_status?: string;
  address?: string;
  role_details?: Record<string, string>;
  requested_role?: string;
  application?: {
    id: number;
    status: string;
    requested_role: string;
    source_role: string;
    verification_data?: Record<string, unknown>;
    rejection_reason?: string;
    created_at?: string;
  } | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", profile_image: "" });
  const [applicationForm, setApplicationForm] = useState<
    Record<string, string>
  >({});
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [ownerRestaurants, setOwnerRestaurants] = useState<Restaurant[]>([]);
  const { data: notificationData } = useNotifications();
  const notifications = notificationData?.items ?? [];
  const recentNotifications = notifications.slice(0, 3);
  const markNotification = useMarkNotificationRead();

  useEffect(() => {
    async function load() {
      try {
        const payload = await apiRequest<{ profile: UserProfile }>(
          "/api/profile",
        );
        setProfile(payload.profile);
        setForm({
          name: payload.profile.name ?? "",
          phone: payload.profile.phone ?? "",
          profile_image: payload.profile.profile_image ?? "",
        });
        setApplicationForm(
          Object.fromEntries(
            Object.entries(
              payload.profile.application?.verification_data ?? {},
            ).map(([key, value]) => [key, String(value ?? "")]),
          ),
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load profile",
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  useEffect(() => {
    if (profile?.role !== "customer") return;
    void apiRequest<Coupon[]>("/api/coupons")
      .then((payload) => setCoupons(payload ?? []))
      .catch((loadError) =>
        setError(toErrorMessage(loadError, "Unable to load coupons")),
      );
  }, [profile?.role]);

  useEffect(() => {
    if (profile?.role !== "owner") return;
    void apiRequest<Restaurant[]>("/api/owner/restaurants")
      .then((payload) => setOwnerRestaurants(payload ?? []))
      .catch((loadError) =>
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load restaurant details",
        ),
      );
  }, [profile?.role]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = await apiRequest<{ profile: UserProfile }>("/api/profile", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setProfile((current) =>
        current ? { ...current, ...payload.profile } : payload.profile,
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update profile",
      );
    } finally {
      setSaving(false);
    }
  }

  async function resubmitRoleRequest() {
    if (!profile?.application?.requested_role) return;

    setResubmitting(true);
    setError("");
    try {
      const payload = await apiRequest<{
        request: NonNullable<UserProfile["application"]>;
      }>("/api/role-requests", {
        method: "POST",
        body: JSON.stringify({
          requestedRole: profile.application.requested_role,
          details: "Role request resubmitted for review.",
          verificationData: applicationForm,
        }),
      });

      setProfile((current) =>
        current
          ? {
              ...current,
              application: {
                ...(current.application ?? {
                  id: 0,
                  status: "PENDING",
                  requested_role: profile.application?.requested_role,
                  source_role: profile.role,
                  verification_data:
                    profile.application?.verification_data ?? {},
                  rejection_reason: "",
                  created_at: new Date().toISOString(),
                }),
                ...payload.request,
                status: payload.request?.status ?? "PENDING",
                verification_data:
                  payload.request?.verification_data ??
                  profile.application?.verification_data ??
                  {},
                rejection_reason: payload.request?.rejection_reason ?? "",
              },
            }
          : current,
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to resubmit request",
      );
    } finally {
      setResubmitting(false);
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-8">Loading profile…</div>;
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 text-red-600">
        {error || "Profile unavailable"}
      </div>
    );
  }

  const roleTitle =
    profile.role === "owner"
      ? "Restaurant Owner"
      : profile.role === "rider"
        ? "Rider"
        : profile.role === "admin"
          ? "Admin"
          : "Customer";
  const applicationStatus = profile.application?.status?.toUpperCase();
  const roleDetails = Object.entries(profile.role_details ?? {});
  const applicationFields =
    profile.application?.requested_role === "rider"
      ? [
          ["nid_number", "NID / National ID"],
          ["vehicle_type", "Vehicle type"],
          ["vehicle_plate", "Vehicle plate"],
          ["license_number", "Driving licence number"],
        ]
      : [
          ["nid_number", "NID / National ID"],
          ["restaurant_name", "Restaurant / business name"],
          ["business_address", "Business address"],
          ["trade_license", "Trade licence"],
        ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {roleTitle} profile
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            My profile
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            {profile.role}
          </span>
          <span className="rounded-full border border-emerald-600/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
            {profile.account_status ?? "active"}
          </span>
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {profile.application && (
        <section className="mb-6 rounded border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Role application
              </span>
              <div className="mt-2 font-serif text-2xl font-bold">
                {applicationStatus === "PENDING" &&
                  "Application Under Review. Rider/Owner features will unlock once approved."}
                {applicationStatus === "REJECTED" && "Application rejected"}
                {applicationStatus === "APPROVED" &&
                  "Role application approved"}
              </div>
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              {profile.application.status}
            </span>
          </div>
          {applicationStatus === "REJECTED" && (
            <div className="mt-3 rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              Rejection reason: {profile.application.rejection_reason || "No reason was provided."}
            </div>
          )}
          {applicationStatus === "REJECTED" && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Correct the application details before submitting a new request.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {applicationFields.map(([key, label]) => (
                  <label key={key} className="text-xs font-semibold text-muted-foreground">
                    {label}
                    <input
                      value={applicationForm[key] ?? ""}
                      onChange={(event) =>
                        setApplicationForm((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                      className="mt-1 h-10 w-full rounded border border-border bg-background px-3 text-sm font-normal text-foreground"
                    />
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() => void resubmitRoleRequest()}
                disabled={resubmitting}
                className="mt-4 rounded bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-foreground disabled:opacity-50"
              >
                {resubmitting ? (
                  <LoadingSpinner label="Resubmitting…" />
                ) : (
                  "Re-submit application"
                )}
              </button>
            </div>
          )}
        </section>
      )}

      <section className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="rounded border border-border bg-card p-6">
          <div className="flex flex-col items-center">
            <Image
              className="h-28 w-28 rounded-full border border-border object-cover"
              src={profile.profile_image || "/placeholder-user.jpg"}
              alt={`${profile.name} profile photo`}
              width={112}
              height={112}
            />
            <h2 className="mt-4 font-serif text-2xl font-bold">
              {profile.name}
            </h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded bg-secondary px-2 py-1">
                {roleTitle}
              </span>
              <span className="rounded bg-secondary px-2 py-1">
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <dl className="mt-8 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-semibold">{profile.phone || "Not set"}</dd>
            </div>
            {roleDetails.map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between gap-4 border-b border-border pb-2"
              >
                <dt className="capitalize text-muted-foreground">
                  {key.replaceAll("_", " ")}
                </dt>
                <dd className="break-all text-right font-semibold">{value}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <dt className="text-muted-foreground">Address</dt>
              <dd className="text-right font-semibold">
                {profile.address || "No saved address"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <dt className="text-muted-foreground">Account status</dt>
              <dd className="font-semibold">
                {profile.account_status ?? "active"}
              </dd>
            </div>
          </dl>
        </aside>

        <main className="space-y-8">
          {profile.role === "owner" && (
            <section className="rounded border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold">
                    My restaurants
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Branch contact, service, and delivery-location details
                  </p>
                </div>
                <Link
                  href="/owner"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Manage restaurants
                </Link>
              </div>
              <div className="grid gap-4">
                {ownerRestaurants.map((restaurant) => (
                  <article
                    key={restaurant.id}
                    className="border border-border bg-background p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{restaurant.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {restaurant.address}
                          {restaurant.area ? `, ${restaurant.area}` : ""}
                        </p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {restaurant.isActive ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-muted-foreground">Contact</dt>
                        <dd>{restaurant.phone || restaurant.email || "Not set"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Hours</dt>
                        <dd>
                          {restaurant.openingTime && restaurant.closingTime
                            ? `${restaurant.openingTime}–${restaurant.closingTime}`
                            : "Not set"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">Cuisines</dt>
                        <dd>{restaurant.cuisines.join(", ") || "Not set"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Delivery terms
                        </dt>
                        <dd>
                          ৳{restaurant.deliveryFee} fee · ৳{restaurant.minimumOrder}{" "}
                          minimum
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-muted-foreground">
                          Map coordinates
                        </dt>
                        <dd>
                          {restaurant.latitude != null &&
                          restaurant.longitude != null
                            ? `${restaurant.latitude}, ${restaurant.longitude}`
                            : "Not selected"}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
                {!ownerRestaurants.length && (
                  <p className="text-sm text-muted-foreground">
                    No restaurant branches yet.
                  </p>
                )}
              </div>
            </section>
          )}

          {profile.role === "customer" && (
            <section className="rounded border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold">My coupons</h2>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Available offers
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="border border-border bg-background p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <strong className="tracking-wide">{coupon.code}</strong>
                      <span className="text-sm font-bold text-primary">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% off`
                          : `৳${coupon.discountValue} off`}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Minimum order ৳{coupon.minimumOrder}
                      {coupon.expiryDate
                        ? ` · Expires ${new Date(coupon.expiryDate).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                ))}
                {!coupons.length && (
                  <p className="text-sm text-muted-foreground">
                    No available coupons right now.
                  </p>
                )}
              </div>
            </section>
          )}

          <section className="rounded border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold">Notifications</h2>
              <div className="flex items-center gap-3 text-xs">
                <span className="uppercase tracking-wide text-muted-foreground">
                  {notificationData?.unreadCount ?? 0} unread
                </span>
                <Link
                  href="/notifications"
                  className="font-semibold text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              {recentNotifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`border p-4 ${notification.isRead ? "border-border bg-background" : "border-primary/40 bg-primary/5"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong>{notification.title}</strong>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {notification.message || "No message"}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => markNotification.mutate(notification.id)}
                        className="shrink-0 text-xs font-bold text-primary hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </article>
              ))}
              {!recentNotifications.length && (
                <p className="text-sm text-muted-foreground">
                  No notifications yet.
                </p>
              )}
            </div>
          </section>

          {/* Edit Profile Form */}
          <section className="rounded border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold">Edit profile</h2>
            </div>
            <form onSubmit={saveProfile} className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Full name
                </span>
                <input
                  className="w-full border border-border bg-background px-3 py-2"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Phone
                </span>
                <input
                  className="w-full border border-border bg-background px-3 py-2"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                />
              </label>

              {/* Profile Image Uploader */}
              <div className="block md:col-span-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Profile Photo
                </span>
                <div className="flex flex-wrap items-center gap-4 rounded border border-border bg-background p-3">
                  <Image
                    src={form.profile_image || "/placeholder-user.jpg"}
                    alt="Current avatar"
                    width={48}
                    height={48}
                    className="size-12 rounded-full object-cover border border-border"
                  />
                  <div className="flex flex-col gap-1">
                    <UploadButton
                      endpoint="profilePicture"
                      onUploadProgress={() => setUploadingImage(true)}
                      onClientUploadComplete={(res) => {
                        setUploadingImage(false);
                        const url = res?.[0]?.ufsUrl || res?.[0]?.url;
                        if (url)
                          setForm((prev) => ({ ...prev, profile_image: url }));
                      }}
                      onUploadError={(error: Error) => {
                        setUploadingImage(false);
                        alert(`Upload failed: ${error.message}`);
                      }}
                      appearance={{
                        button:
                          "bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-md",
                        allowedContent: "text-muted-foreground text-[11px]",
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {uploadingImage
                        ? "Uploading photo..."
                        : "Upload a new avatar"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  disabled={saving || uploadingImage}
                  className="rounded bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {saving ? (
                    <LoadingSpinner label="Saving…" />
                  ) : (
                    "Save profile"
                  )}
                </button>
              </div>
            </form>
          </section>

        </main>
      </section>
    </div>
  );
}
