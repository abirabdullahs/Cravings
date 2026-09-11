import {
  createUser,
  findUserByEmail,
  completeUser,
  createRiderProfile,
} from "../repository/auth.repository";
import { hashPassword } from "../utils/password";
import { AppError } from "@/lib/errors/AppError";
import { ErrorCode } from "@/lib/errors/errorCodes";

const roles = new Set(["customer", "owner", "rider"]);

function normalizeRole(value: string) {
  const role =
    value.toLowerCase() === "restaurant_owner" ? "owner" : value.toLowerCase();

  if (!roles.has(role)) {
    throw new AppError(ErrorCode.INVALID_ROLE);
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
    throw new AppError(ErrorCode.INVALID_ROLE);
  }

  const existingUser = await findUserByEmail(user.email);
  if (existingUser) {
    throw new AppError(ErrorCode.USER_EXISTS);
  }

  const data = await createUser({
    email: user.email,
    name: user.name,
    password: await hashPassword(user.password),
    phone: user.phone,
    role,
  });

  if(role === "rider") {
    await createRiderProfile(data.id);
  }
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
