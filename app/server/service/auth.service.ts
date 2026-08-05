import { createUser, findUserByEmail } from "../repository/auth.repository";
import { hashPassword } from "../utils/password";
import { User } from "../types/user";


export const getUserByEmail = (email: string) => {
    return findUserByEmail(email);
}


export const createAccount = async (user :User) => {
    const data = await createUser( {email: user.email, name: user.name, password: await hashPassword(user.password), number: user.number, role: user.role});
    return data;
}