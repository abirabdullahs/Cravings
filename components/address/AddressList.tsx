"use client";

import { useState } from "react";
import { useAddressManager } from "@/hooks/useAddressManager";
import type { UserAddress } from "@/types/order";
import { AddressFormDialog } from "./AddressFormDialog";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface AddressListProps {
  onSelectAddress?: (address: UserAddress) => void;
  showActions?: boolean;
}

export function AddressList({
  onSelectAddress,
  showActions = true,
}: AddressListProps) {
  const {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    isAdding,
    isUpdating,
    isDeleting,
  } = useAddressManager();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | undefined>(
    undefined,
  );
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);

  const handleOpenDialog = (address?: UserAddress) => {
    setEditingAddress(address);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAddress(undefined);
  };

  const handleSubmit = async (formData: UserAddress) => {
    if (editingAddress?.id) {
      await updateAddress(editingAddress.id, formData);
    } else {
      await addAddress(formData);
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this address?")) {
      setDeletingAddressId(id);
      try {
        await deleteAddress(id);
      } finally {
        setDeletingAddressId(null);
      }
    }
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="h-44 animate-pulse border border-border bg-muted"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="border border-dashed border-border bg-card px-6 py-12 text-center">
          <MapPin className="mx-auto size-8 text-primary" aria-hidden="true" />
          <h2 className="mt-4 font-serif text-xl font-bold text-foreground">
            No saved addresses
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a delivery location to make checkout faster.
          </p>
          {showActions && (
            <button
              type="button"
              onClick={() => handleOpenDialog()}
              className="mt-5 inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add Your First Address
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-2">
            {addresses.map((address) => (
              <article
                key={address.id}
                className="flex min-h-44 flex-col border border-border bg-card p-5 transition-colors hover:border-primary/50"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
                    <MapPin className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-lg font-bold text-foreground">
                      {address.label || "Delivery address"}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-foreground">
                      {address.address}
                    </p>
                    {(address.street || address.apartmentName) && (
                      <p className="text-xs leading-5 text-muted-foreground">
                        {[address.street, address.apartmentName]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                    <p className="text-xs leading-5 text-muted-foreground">
                      {[address.city, address.postalCode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>

                {showActions && (
                  <div className="mt-auto flex gap-2 border-t border-border pt-4">
                    <button
                      type="button"
                      onClick={() => handleOpenDialog(address)}
                      disabled={isUpdating || isDeleting}
                      className="inline-flex flex-1 items-center justify-center gap-2 border border-border px-3 py-2 text-xs font-semibold text-foreground hover:border-primary hover:text-primary disabled:opacity-50"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(address.id)}
                      disabled={isDeleting || isUpdating}
                      className="inline-flex flex-1 items-center justify-center gap-2 border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                      {deletingAddressId === address.id ? (
                        <LoadingSpinner label="Deleting…" />
                      ) : (
                        <>
                          <Trash2 className="size-3.5" aria-hidden="true" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                )}

                {onSelectAddress && !showActions && (
                  <button
                    type="button"
                    onClick={() => onSelectAddress(address)}
                    className="mt-4 w-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Use This Address
                  </button>
                )}
              </article>
            ))}
          </div>

          {showActions && (
            <button
              type="button"
              onClick={() => handleOpenDialog()}
              className="flex w-full items-center justify-center gap-2 border border-dashed border-primary/50 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add another address
            </button>
          )}
        </>
      )}

      <AddressFormDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        initialAddress={editingAddress}
        isLoading={isAdding || isUpdating}
      />
    </div>
  );
}
