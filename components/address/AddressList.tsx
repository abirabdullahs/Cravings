"use client";

import { useState } from "react";
import { useAddressManager } from "@/hooks/useAddressManager";
import type { UserAddress } from "@/types/order";
import { AddressFormDialog } from "./AddressFormDialog";

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
      await deleteAddress(id);
    }
  };

  if (loading && addresses.length === 0) {
    return <div className="py-8 text-center">Loading addresses...</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="rounded-md border-2 border-dashed border-gray-300 py-8 text-center">
          <p className="mb-4 text-gray-600">No addresses saved yet</p>
          {showActions && (
            <button
              onClick={() => handleOpenDialog()}
              className="rounded-md bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
            >
              Add Your First Address
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {address.label && (
                      <p className="font-semibold text-gray-900">
                        {address.label}
                      </p>
                    )}
                    <p className="text-gray-700">{address.address}</p>
                    {address.street && (
                      <p className="text-sm text-gray-600">{address.street}</p>
                    )}
                    {address.apartmentName && (
                      <p className="text-sm text-gray-600">
                        {address.apartmentName}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {address.city}
                      {address.postalCode && `, ${address.postalCode}`}
                    </p>
                  </div>

                  {showActions && (
                    <div className="ml-4 flex gap-2">
                      <button
                        onClick={() => handleOpenDialog(address)}
                        disabled={isUpdating}
                        className="rounded bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        disabled={isDeleting}
                        className="rounded bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {onSelectAddress && !showActions && (
                  <button
                    onClick={() => onSelectAddress(address)}
                    className="mt-3 w-full rounded-md bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
                  >
                    Use This Address
                  </button>
                )}
              </div>
            ))}
          </div>

          {showActions && (
            <button
              onClick={() => handleOpenDialog()}
              className="w-full rounded-lg border-2 border-dashed border-orange-300 px-4 py-3 font-medium text-orange-600 hover:bg-orange-50"
            >
              + Add Another Address
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
