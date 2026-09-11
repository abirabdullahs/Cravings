import { pool } from "@/lib/db";
import {
  FIND_USER_ADDRESSES,
  INSERT_ADDRESS,
  UPDATE_ADDRESS,
  DELETE_ADDRESS,
  FIND_ADDRESS_BY_ID,
} from "../query/address.query";

export interface UserAddress {
  id: number;
  label: string | null;
  address: string;
  street: string | null;
  apartmentName: string | null;
  city: string;
  postalCode: string | null;
  latitude?: number;
  longitude?: number;
}

interface AddressRow {
  id: number;
  label: string | null;
  address: string;
  street: string | null;
  apartment_name: string | null;
  city: string;
  postal_code: string | null;
  latitude?: number;
  longitude?: number;
}

function toUserAddress(row: AddressRow): UserAddress {
  return {
    id: row.id,
    label: row.label ?? null,
    address: row.address,
    street: row.street ?? null,
    apartmentName: row.apartment_name ?? null,
    city: row.city,
    postalCode: row.postal_code ?? null,
    latitude: row.latitude,
    longitude: row.longitude,
  };
}

export const findUserAddresses = async (userId: number | string) => {
  const data = await pool.query(FIND_USER_ADDRESSES, [userId]);
  return data.rows.map(toUserAddress);
};

export const findAddressById = async (
  addressId: number | string,
  userId: number | string,
) => {
  const data = await pool.query(FIND_ADDRESS_BY_ID, [addressId, userId]);
  return data.rows[0] ? toUserAddress(data.rows[0]) : null;
};

export const insertAddress = async ({
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
}) => {
  const data = await pool.query(INSERT_ADDRESS, [
    userId,
    label ?? null,
    address,
    street ?? null,
    apartmentName ?? null,
    city,
    postalCode ?? null,
    latitude ?? null,
    longitude ?? null,
  ]);
  return data.rows[0] ? toUserAddress(data.rows[0]) : null;
};

export const updateAddress = async ({
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
}) => {
  const data = await pool.query(UPDATE_ADDRESS, [
    addressId,
    label ?? null,
    address,
    street ?? null,
    apartmentName ?? null,
    city,
    postalCode ?? null,
    latitude ?? null,
    longitude ?? null,
    userId,
  ]);
  return data.rows[0] ? toUserAddress(data.rows[0]) : null;
};

export const deleteAddress = async (
  addressId: number | string,
  userId: number | string,
) => {
  const data = await pool.query(DELETE_ADDRESS, [addressId, userId]);
  return data.rows[0] ? data.rows[0].id : null;
};
