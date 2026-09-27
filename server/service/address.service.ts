import {
  findUserAddresses,
  findAddressById,
  insertAddress,
  updateAddress,
  deleteAddress,
  type UserAddress,
} from "../repository/address.repository";

export const getUserAddresses = (
  userId: number | string,
): Promise<UserAddress[]> => findUserAddresses(userId);

export const getAddressById = (
  addressId: number | string,
  userId: number | string,
): Promise<UserAddress | null> => findAddressById(addressId, userId);

export const createAddress = ({
  userId,
  label,
  address,
  street,
  apartmentName,
  city,
  postalCode,
  latitude,
  longitude,
}: {
  userId: number | string;
  label?: string;
  address: string;
  street?: string;
  apartmentName?: string;
  city: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}): Promise<UserAddress | null> =>
  insertAddress({
    userId,
    label,
    address,
    street,
    apartmentName,
    city,
    postalCode,
    latitude,
    longitude,
  });

export const updateAddressRecord = ({
  addressId,
  userId,
  label,
  address,
  street,
  apartmentName,
  city,
  postalCode,
  latitude,
  longitude,
}: {
  addressId: number | string;
  userId: number | string;
  label?: string;
  address: string;
  street?: string;
  apartmentName?: string;
  city: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}): Promise<UserAddress | null> =>
  updateAddress({
    addressId,
    userId,
    label,
    address,
    street,
    apartmentName,
    city,
    postalCode,
    latitude,
    longitude,
  });

export const removeAddress = (
  addressId: number | string,
  userId: number | string,
): Promise<number | null> => deleteAddress(addressId, userId);
