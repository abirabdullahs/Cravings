"use client";

import { AddressButton } from "@/components/address/AddressSelection";
import { useAddresses } from "@/hooks/useAddressManager";
import { useSelectedAddress } from "@/components/address/useSelectedAddress";

export function LocationAddress() {
  const { data: addresses = [] } = useAddresses();
  const { selectedAddress, selectAddress } = useSelectedAddress(addresses);

  return (
    <AddressButton
      selectedAddress={selectedAddress}
      onAddressSelect={selectAddress}
      triggerClassName="hidden sm:inline-flex"
    />
  );
}
