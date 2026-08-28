import {
  createUser,
  findUserByEmail,
  completeUser,
} from "../repository/auth.repository";
import { hashPassword } from "../utils/password";

const roles = new Set(["customer", "owner", "rider"]);

function normalizeRole(value: string) {
  const role =
    value.toLowerCase() === "restaurant_owner" ? "owner" : value.toLowerCase();

  if (!roles.has(role)) {
    throw new Error("INVALID_ROLE");
  }

  return role;
}

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
  const role = normalizeRole(user.role);

  if (!roles.has(role)) {
    throw new Error("INVALID_ROLE");
  }

  const existingUser = await findUserByEmail(user.email);
  if (existingUser) {
    throw new Error("USER_EXISTS");
  }

  const data = await createUser({
    email: user.email,
    name: user.name,
    password: await hashPassword(user.password),
    phone: user.phone,
    role,
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
  const data = await completeUser({ role: normalizeRole(role), phone, id });
  return data;
};
