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
    if (error instanceof Error && error.message === "USER_EXISTS") {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }
    if (error instanceof Error && error.message === "INVALID_ROLE") {
      return NextResponse.json(
        { error: "Invalid account role" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Unable to create account" },
      { status: 500 },
    );
  }
};
