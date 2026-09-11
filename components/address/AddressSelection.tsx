"use client";

import { useState, useEffect } from "react";
import { MapPinIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddressFormDialog } from "./AddressFormDialog";
import { useAddressManager } from "@/hooks/useAddressManager";
import type { UserAddress } from "@/types/order";
import { createPortal } from "react-dom";

interface AddressSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (address: UserAddress) => void;
  selectedAddressId?: number;
}

export function AddressSelectionModal({
  isOpen,
  onClose,
  onSelectAddress,
  selectedAddressId,
}: AddressSelectionModalProps) {
  const { addresses, loading, addAddress, isAdding } = useAddressManager();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [mounted, setMounted] = useState(false);

  // Ensures code only runs on the client side to avoid SSR hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // ... keep your state & handlers unchanged (formData, errors, handleSubmit, etc.)

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      {!isFormOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-border bg-card p-6 shadow-lg">
            <h2 className="mb-4 font-serif text-xl font-bold text-foreground">
              Select Delivery Address
            </h2>

            <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
              {loading ? (
                <p className="text-xs text-muted-foreground">
                  Loading addresses...
                </p>
              ) : addresses.length ? (
                addresses.map((address) => (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => {
                      onSelectAddress(address);
                      onClose();
                    }}
                    className={cn(
                      "w-full border p-3 text-left transition-colors",
                      selectedAddressId === address.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/50",
                    )}
                  >
                    <span className="block font-serif text-xs font-bold text-foreground">
                      {address.label || "Delivery Address"}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {address.address}, {address.city}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  No saved addresses yet.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="mt-4 w-full border border-dashed border-primary p-2 text-xs font-semibold text-primary hover:bg-primary/5"
            >
              + Add New Address
            </button>

            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full border border-border bg-background py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <AddressFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={async (address) => {
          const created = await addAddress(address);
          if (created) onSelectAddress(created);
          setIsFormOpen(false);
          onClose();
        }}
        isLoading={isAdding}
      />
    </>, document.body
  );
}

export function AddressButton({
  selectedAddress,
  onAddressSelect,
  triggerClassName,
  className,
}: {
  selectedAddress?: UserAddress;
  onAddressSelect?: (address: UserAddress) => void;
  triggerClassName?: string;
  className?: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary",
          triggerClassName,
          className,
        )}
      >
        <MapPinIcon className="size-3.5 text-primary" aria-hidden="true" />
        <span className="truncate">
          {selectedAddress?.label || selectedAddress?.city || "Select Address"}
        </span>
      </button>

      <AddressSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectAddress={(addr) => onAddressSelect?.(addr)}
        selectedAddressId={selectedAddress?.id}
      />
    </>
  );
}
