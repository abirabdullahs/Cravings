import { AppError } from "@/lib/errors/AppError";
import { createAccount } from "@/server/service/auth.service";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  let email: string | undefined;

  try {
    const data = await request.json();
    if (
      typeof data?.name !== "string" ||
      typeof data?.email !== "string" ||
      typeof data?.password !== "string" ||
      typeof data?.phone !== "string" ||
      typeof data?.role !== "string"
    ) {
      return NextResponse.json(
        { error: "All registration fields are required" },
        { status: 400 },
      );
    }
    email = data.email.trim().toLowerCase();
    data.email = email;
    const user = await createAccount(data);
    return NextResponse.json(user, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    
    return NextResponse.json(
      { error: "Unable to create account" , message: (error as Error).message },
      { status: 500 },
    );
  }
};
