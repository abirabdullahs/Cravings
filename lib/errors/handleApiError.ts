// lib/errors/handleApiError.ts
import { NextResponse } from "next/server";
import { AppError } from "./AppError";
import { ErrorCode } from "./errorCodes";

export function handleApiError(
  error: unknown,
  fallbackMessage = "Internal server error",
) {
  if (error instanceof AppError) {
    return NextResponse.json(error.toJSON(), { status: error.status });
  }

  
  console.error("UNHANDLED BACKEND ERROR:", error);

  const status = (error as { status?: number }).status || 200;
  const isDev = process.env.NODE_ENV === "development";
 
  return NextResponse.json(
    {
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: fallbackMessage,
        ...(isDev && {
          details: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        }),
      },
    },
    { status: 500 },
  );
}
