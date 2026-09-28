"use client";

import { AddressList } from "@/components/address/AddressList";

export default function AddressesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 border-b border-border pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Delivery details
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Saved addresses
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage the locations you use for delivery.
          </p>
        </div>

        <AddressList showActions />
      </div>
    </div>
  );
}
