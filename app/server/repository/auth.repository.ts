import { pool } from "@/app/lib/db"
import { FIND_USER_BY_EMAIL, INSERT_USER, COMPLETE_USER } from "../query/auth.query"
import { User } from "../types/user";



export const findUserByEmail = async (email: string)=>{
    const result = await pool.query(FIND_USER_BY_EMAIL,[email]);
    return result.rows[0];
}



export const createUser = async (user: User) => {

  const data = [user.email, user.name, user.password, user.phone, user.role];
  const result = await pool.query(INSERT_USER, data);
  return result.rows[0];
}

export const completeUser = async ({role, phone, id }: { phone: string; role: string, id: string }) => {
  const data = [role, phone, id];
  const result = await pool.query(COMPLETE_USER, data);
  return result.rows[0];
}