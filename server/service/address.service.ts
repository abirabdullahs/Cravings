import { findUserAddresses } from "../repository/cart.repository";

export const getUserAddresses = (userId: string) => findUserAddresses(userId);
