import { AppError } from "./errors/AppError";
import { ErrorCode } from "./errors/errorCodes";

export function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export async function apiRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = body?.error;
    const rawCode =
      errorBody && typeof errorBody === "object" ? errorBody.code : undefined;
    const message =
      (errorBody && typeof errorBody === "object" && errorBody.message) ||
      (typeof errorBody === "string" && errorBody) ||
      (typeof body?.message === "string" && body.message) ||
      "An unexpected error occurred";

    const code: ErrorCode =
      typeof rawCode === "string" &&
      Object.values(ErrorCode).includes(rawCode as ErrorCode)
        ? (rawCode as ErrorCode)
        : ErrorCode.INTERNAL_ERROR;

    const details =
      errorBody && typeof errorBody === "object"
        ? errorBody.details
        : undefined;
    throw new AppError(code, String(message), details);
  }

  return body as T;
}
