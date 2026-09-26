"use client";

import { useEffect, useState } from "react";
import type { UserAddress } from "@/types/order";

const STORAGE_KEY = "cravings:selected-address-id";
const CHANGE_EVENT = "cravings:selected-address-changed";

function readStoredAddressId() {
  if (typeof window === "undefined") return null;

  const value = Number(window.localStorage.getItem(STORAGE_KEY));
  return Number.isInteger(value) && value > 0 ? value : null;
}

export function useSelectedAddress(addresses: UserAddress[]) {
  const [selectedAddressId, setSelectedAddressIdState] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const sync = () => setSelectedAddressIdState(readStoredAddressId());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);

  const selectedAddress =
    addresses.find((address) => address.id === selectedAddressId) ??
    addresses[0];

  useEffect(() => {
    if (!selectedAddress?.id || selectedAddress.id === selectedAddressId) return;
    window.localStorage.setItem(STORAGE_KEY, String(selectedAddress.id));
  }, [selectedAddress?.id, selectedAddressId]);

  function selectAddress(address: UserAddress) {
    if (!address.id) return;
    window.localStorage.setItem(STORAGE_KEY, String(address.id));
    setSelectedAddressIdState(address.id);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return {
    selectedAddress,
    selectedAddressId: selectedAddress?.id ?? null,
    selectAddress,
  };
}
