import { pool } from "@/app/lib/db"
import { Create_User, Find_User_By_Email } from "../query/auth.query"
import { User } from "../types/user";



export const findUserByEmail = async (email: string)=>{
    const result = await pool.query(Find_User_By_Email,[email]);
    return result.rows[0];
}



export const createUser = async (user: User) => {
  const existinguser = await findUserByEmail(user.email);
  if (existinguser) {
    throw new Error("User already exists");
  }

  const data = [user.email, user.name, user.password, user.number, user.role];
  const result = await pool.query(Create_User, data);
  return result.rows[0];
}