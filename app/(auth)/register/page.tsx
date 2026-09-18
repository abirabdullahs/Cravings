"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestedRole, setRequestedRole] = useState<string>("customer");

  const getRoleBasedRedirect = (role: string): string => {
    const normalizedRole = role.toLowerCase();
    switch (normalizedRole) {
      case "owner":
        return "/restaurant";
      case "rider":
        return "/rider";
      case "admin":
        return "/admin";
      case "customer":
      default:
        return "/";
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const role = formData.get("role") as string;
    const roleToSubmit = String(role ?? "customer").toLowerCase();
    const verificationData = roleToSubmit === "owner" || roleToSubmit === "rider"
      ? {
          nid_number: String(formData.get("nid") ?? ""),
          vehicle_type: String(formData.get("vehicleType") ?? ""),
          vehicle_plate: String(formData.get("vehiclePlate") ?? ""),
          license_number: String(formData.get("licenseNumber") ?? ""),
          restaurant_name: String(formData.get("restaurantName") ?? ""),
          business_address: String(formData.get("businessAddress") ?? ""),
          trade_license: String(formData.get("tradeLicense") ?? ""),
        }
      : {};

    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: roleToSubmit,
      phone: formData.get("number") as string,
      verificationData,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to register.");
        return;
      }
      const signInRes = await signIn("credentials", {
        email: payload.email,
        password: payload.password,
        redirect: false,
      });

      if (signInRes?.error) {
        throw new Error("Account created, but failed to log in automatically.");
      }
      router.refresh();
      const redirectPath = getRoleBasedRedirect(role);
      router.push(redirectPath);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected network error occurred.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-lg border border-border bg-card shadow-sm md:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden flex-col justify-between bg-secondary/60 p-10 md:flex">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Join Cravings
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground">
              Your next favorite meal starts here.
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
              Create an account to explore Dhaka&apos;s kitchens and make every order feel personal.
            </p>
          </div>
          <p className="text-sm font-medium text-foreground/70">Cravings<span className="text-primary">.</span></p>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-medium text-primary md:hidden">Join Cravings</p>
            <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-foreground">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A few details and you&apos;re ready to order.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Full name
                <input
                  name="name"
                  type="text"
                  required
                  className="h-11 rounded-sm border border-border bg-background px-3 text-sm normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Phone number
                <input
                  name="number"
                  type="tel"
                  required
                  className="h-11 rounded-sm border border-border bg-background px-3 text-sm normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
              </label>
            </div>

            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Email address
              <input
                name="email"
                type="email"
                required
                className="h-11 rounded-sm border border-border bg-background px-3 text-sm normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Password
                <input
                  name="password"
                  type="password"
                  required
                  className="h-11 rounded-sm border border-border bg-background px-3 text-sm normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Account role
                <select
                  name="role"
                  required
                  value={requestedRole}
                  onChange={(event) => setRequestedRole(event.target.value)}
                  className="h-11 rounded-sm border border-border bg-background px-3 text-sm normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
                >
                  <option value="customer">Customer</option>
                  <option value="rider">Delivery Rider</option>
                  <option value="owner">Restaurant Owner</option>
                </select>
              </label>
            </div>

            {(requestedRole === "rider" || requestedRole === "owner") && (
              <div className="grid gap-4 rounded-sm border border-border bg-secondary/30 p-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  NID / National ID
                  <input name="nid" className="h-11 rounded-sm border border-border bg-background px-3 text-sm" />
                </label>
                {requestedRole === "rider" && (
                  <>
                    <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Vehicle type
                      <input name="vehicleType" className="h-11 rounded-sm border border-border bg-background px-3 text-sm" />
                    </label>
                    <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Vehicle plate
                      <input name="vehiclePlate" className="h-11 rounded-sm border border-border bg-background px-3 text-sm" />
                    </label>
                    <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Driving license number
                      <input name="licenseNumber" className="h-11 rounded-sm border border-border bg-background px-3 text-sm" />
                    </label>
                  </>
                )}
                {requestedRole === "owner" && (
                  <>
                    <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Restaurant / business name
                      <input name="restaurantName" className="h-11 rounded-sm border border-border bg-background px-3 text-sm" />
                    </label>
                    <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Business address
                      <input name="businessAddress" className="h-11 rounded-sm border border-border bg-background px-3 text-sm" />
                    </label>
                    <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Trade license
                      <input name="tradeLicense" className="h-11 rounded-sm border border-border bg-background px-3 text-sm" />
                    </label>
                  </>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRightIcon className="size-4" aria-hidden="true" />}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/complete-profile" })}
            className="h-11 w-full rounded-sm border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
          >
            Continue with Google
          </button>

          <p className="mt-7 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
