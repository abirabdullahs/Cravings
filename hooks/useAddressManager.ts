"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAddresses,
  addAddress as addAddressService,
  updateAddress as updateAddressService,
  deleteAddress as deleteAddressService,
} from "@/services/addressService";
import type { UserAddress } from "@/types/order";

export function useAddresses() {
  return useQuery<UserAddress[]>({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
  });
}

export function useAddressManager() {
  const queryClient = useQueryClient();

  const addressesQuery = useAddresses();

  const addAddressMutation = useMutation({
    mutationFn: (address: UserAddress) => addAddressService(address),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: UserAddress }) =>
      updateAddressService(id, updates),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: number) => deleteAddressService(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  return {
    addresses: addressesQuery.data ?? [],
    loading: addressesQuery.isLoading,
    error: addressesQuery.error
      ? (addressesQuery.error as Error).message
      : null,
    fetchAddresses: addressesQuery.refetch,
    addAddress: (address: UserAddress) =>
      addAddressMutation.mutateAsync(address),
    updateAddress: (id: number, updates: UserAddress) =>
      updateAddressMutation.mutateAsync({ id, updates }),
    deleteAddress: (id: number) => deleteAddressMutation.mutateAsync(id),
    isAdding: addAddressMutation.isPending,
    isUpdating: updateAddressMutation.isPending,
    isDeleting: deleteAddressMutation.isPending,
  };
}
