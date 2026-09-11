"use client";

import { useState } from "react";
import { AddressButton } from "@/components/address/AddressSelection";
import type { UserAddress } from "@/types/order";

export function LocationAddress() {
  const [address, setAddress] = useState<UserAddress>();

  return (
    <AddressButton
      selectedAddress={address}
      onAddressSelect={setAddress}
      triggerClassName="hidden sm:inline-flex"
    />
  );
}
