"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function PendingApprovalPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-16">
      <section className="w-full border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Application under review
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold">
          Your partner application is pending approval
        </h1>
        <p className="mt-4 text-muted-foreground">
          An administrator is reviewing your rider or restaurant owner
          application. You will receive access as soon as it is approved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Return home
          </Link>
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/login" })}
            className="border border-border px-4 py-2 text-sm font-semibold"
          >
            Log out
          </button>
        </div>
      </section>
    </main>
  );
}
