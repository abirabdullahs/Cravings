"use client";

import { AddressList } from "@/components/address/AddressList";

export default function AddressesPage() {
  return (
    <div className="min-h-screen ">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Delivery Addresses
          </h1>
          <p className="text-gray-600">Manage your saved delivery addresses</p>
        </div>

        <div className="bg-primary-foreground rounded-lg shadow">
          <AddressList showActions={true} />
        </div>
      </div>
    </div>
  );
}
