import { apiRequest } from "@/lib/http";
import type { UserAddress } from "@/types/order";

export const fetchAddresses = async (): Promise<UserAddress[]> => {
  return apiRequest<UserAddress[]>("/api/addresses");
};

export const addAddress = async (
  address: UserAddress,
): Promise<UserAddress> => {
  return apiRequest<UserAddress>("/api/addresses", {
    method: "POST",
    body: JSON.stringify(address),
  });
};

export const updateAddress = async (
  id: number,
  updates: UserAddress,
): Promise<UserAddress> => {
  return apiRequest<UserAddress>("/api/addresses", {
    method: "PUT",
    body: JSON.stringify({ ...updates }),
  });
};

export const deleteAddress = async (id: number): Promise<void> => {
  return apiRequest<void>(`/api/addresses?id=${id}`, {
    method: "DELETE",
  });
};
