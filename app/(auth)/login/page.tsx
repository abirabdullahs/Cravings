"use client";

import { useState } from "react";
import Link from "next/link";
import { getSession, signIn } from "next-auth/react";
import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getRoleBasedRedirect = (role: string): string => {
    switch (role.toLowerCase()) {
      case "admin":
        return "/admin";
      case "owner":
        return "/restaurant";
      case "rider":
        return "/rider";
      default:
        return "/";
    }
  };

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Email or password did not match. Try again.");
        return;
      }

      const session = await getSession();
      router.push(getRoleBasedRedirect(session?.user?.role ?? "customer"));
    } catch {
      setError("Unable to sign in right now. Please try again.");
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
              Welcome back
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-foreground">
              Good food is waiting.
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
              Sign in to discover Dhaka&apos;s favorite kitchens and pick up where you left off.
            </p>
          </div>
          <p className="text-sm font-medium text-foreground/70">Cravings<span className="text-primary">.</span></p>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-medium text-primary md:hidden">Welcome back</p>
            <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-foreground">
              Sign in to Cravings
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use your account details to continue.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="grid gap-5">
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Email address
              <input
                name="email"
                type="email"
                required
                className="h-11 rounded-sm border border-border bg-background px-3 text-sm normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </label>

            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Password
              <input
                name="password"
                type="password"
                required
                className="h-11 rounded-sm border border-border bg-background px-3 text-sm normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
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
            New to Cravings?{" "}
            <Link href="/register" className="font-semibold text-primary hover:text-primary/80">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
