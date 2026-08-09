import {
  createUser,
  findUserByEmail,
  completeUser,
} from "../repository/auth.repository";
import { hashPassword } from "../utils/password";
import { User } from "../types/user";

export const getUserByEmail = (email: string) => {
  return findUserByEmail(email);
};

export const createAccount = async (user: {
  email: string;
  name: string;
  password: string;
  phone: string;
  role: string;
}) => {
  const existingUser = await findUserByEmail(user.email);
  if (existingUser) {
    throw new Error("USER_EXISTS"); 
  }

  const data = await createUser({
    email: user.email,
    name: user.name,
    password: await hashPassword(user.password),
    phone: user.phone,
    role: user.role,
  });
  return data;
};

export const completeProfile = async ({
  role,
  phone,
  id,
}: {
  role: string;
  phone: string;
  id: string;
}) => {
  
  const data = await completeUser({ role, phone, id });
  return data;
};
