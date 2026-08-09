import { createAccount } from "@/app/server/service/auth.service";
import { NextResponse } from "next/server";

export const POST = async(request: Request) => {

  try{
    const data = await request.json();
    const user = await createAccount(data);
    return NextResponse.json(user, { status: 201 });
  }
  catch (error: any) {
    return NextResponse.json({error: error.message }, { status: 409 });
  }

}
