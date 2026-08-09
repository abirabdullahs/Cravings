import { pool } from "@/app/lib/db"
import { Create_User, Find_User_By_Email, Complete_User } from "../query/auth.query"
import { User } from "../types/user";



export const findUserByEmail = async (email: string)=>{
    const result = await pool.query(Find_User_By_Email,[email]);
    return result.rows[0];
}



export const createUser = async (user: User) => {

  const data = [user.email, user.name, user.password, user.phone, user.role];
  const result = await pool.query(Create_User, data);
  return result.rows[0];
}

export const completeUser = async ({role, phone, id }: { phone: string; role: string, id: string }) => {
  const data = [role, phone, id];
  const result = await pool.query(Complete_User, data);
  return result.rows[0];
}