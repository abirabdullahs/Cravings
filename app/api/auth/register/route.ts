import { AppError } from "@/lib/errors/AppError";
import {
  createAccount,
  toSafeUserDTO,
  validateRegistrationInput,
} from "@/server/service/auth.service";
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

    const validation = validateRegistrationInput(data);
    if (!validation.valid) {
      return NextResponse.json(
        { error: Object.values(validation.errors)[0] },
        { status: 400 },
      );
    }

    email = validation.normalized.email;
    data.email = email;
    data.name = validation.normalized.name;
    data.phone = validation.normalized.phone;
    data.role = validation.normalized.role;
    const user = await createAccount({
      ...data,
      role: validation.normalized.role,
      verificationData: data.verificationData ?? data.verification_data ?? {},
    });
    return NextResponse.json(toSafeUserDTO(user), { status: 201 });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Unable to create account", message: (error as Error).message },
      { status: 500 },
    );
  }
};
