import bcrypt from "bcryptjs";



export const hashPassword = async (password: string)=>{
  const saltRounds = 10;

  const hashPass = await bcrypt.hash(password, saltRounds);
  return hashPass;
}


export const comparePassword = async(password: string, hashPassword:string)=>{
  return await bcrypt.compare(password, hashPassword)   ;
}