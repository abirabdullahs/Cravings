"use client";

import { useState } from "react";
import { AddressFormDialog } from "@/components/address/AddressFormDialog";
import type { UserAddress } from "@/types/order";

/**
 * Hook for managing a single address dialog
 */
export const useAddressDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | undefined>(
    undefined,
  );

  const open = (address?: UserAddress) => {
    setEditingAddress(address);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setEditingAddress(undefined);
  };

  return {
    isOpen,
    open,
    close,
    editingAddress,
  };
};

/**
 * Dialog wrapper component
 */
export function AddressDialog({
  isOpen,
  onClose,
  onSubmit,
  initialAddress,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (address: UserAddress) => Promise<void | UserAddress>;
  initialAddress?: UserAddress;
  isLoading?: boolean;
}) {
  return (
    <AddressFormDialog
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      initialAddress={initialAddress}
      isLoading={isLoading}
    />
  );
}
