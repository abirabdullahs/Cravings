"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing";
import {
  useNotifications,
  useMarkNotificationRead,
} from "@/hooks/useNotifications";

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
  history: Array<{ title: string; detail: string; timestamp?: string }>;
};

type Coupon = {
  id: number;
  code: string;
  discount_type: string;
  discount_value: string;
  minimum_order: string;
  expiry_date: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", profile_image: "" });
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const { data: notifications = [] } = useNotifications();
  const markNotification = useMarkNotificationRead();

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) {
          throw new Error("Unable to load profile");
        }
        const payload = await response.json();
        setProfile(payload.profile);
        setForm({
          name: payload.profile.name ?? "",
          phone: payload.profile.phone ?? "",
          profile_image: payload.profile.profile_image ?? "",
        });
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
    void fetch("/api/coupons")
      .then((response) => (response.ok ? response.json() :[] ))
      .then((payload) => setCoupons(payload ?? []));
  }, [profile?.role]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        throw new Error("Unable to update profile");
      }
      const payload = await response.json();
      setProfile(payload.profile);
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
      const response = await fetch("/api/role-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestedRole: profile.application.requested_role,
          details: "Role request resubmitted for review.",
          verificationData: profile.application.verification_data ?? {},
        }),
      });

      if (!response.ok) {
        const payload = await response
          .json()
          .catch(() => ({ error: "Unable to resubmit request" }));
        throw new Error(payload.error || "Unable to resubmit request");
      }

      const payload = await response.json();
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
          {applicationStatus === "REJECTED" &&
            profile.application.rejection_reason && (
              <div className="mt-3 rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                Rejection reason: {profile.application.rejection_reason}
              </div>
            )}
          {applicationStatus === "REJECTED" && (
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void resubmitRoleRequest()}
                disabled={resubmitting}
                className="rounded bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-foreground disabled:opacity-50"
              >
                {resubmitting ? "Resubmitting..." : "Re-submit application"}
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
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}% off`
                          : `৳${coupon.discount_value} off`}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Minimum order ৳{coupon.minimum_order}
                      {coupon.expiry_date
                        ? ` · Expires ${new Date(coupon.expiry_date).toLocaleDateString()}`
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
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {
                  notifications.filter((notification) => !notification.isRead)
                    .length
                }{" "}
                unread
              </span>
            </div>
            <div className="space-y-3">
              {notifications.map((notification) => (
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
              {!notifications.length && (
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
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold">
                Latest history / recent activity
              </h2>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {profile.role}
              </span>
            </div>
            <div className="space-y-3">
              {profile.history.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No recent activity found.
                </p>
              )}
              {profile.history.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between border-b border-border py-3 last:border-0"
                >
                  <div>
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.detail}
                    </div>
                  </div>
                  {item.timestamp && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      </section>
    </div>
  );
}
