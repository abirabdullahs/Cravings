import { AppError } from "./errors/AppError";
import { ErrorCode } from "./errors/errorCodes";


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
   const rawCode = body?.error?.code;
   const message = body?.error?.message ?? "An unexpected error occurred";

   const code: ErrorCode =
     rawCode && rawCode in ErrorCode
       ? (rawCode as ErrorCode)
       : ErrorCode.INTERNAL_ERROR;

   throw new AppError(code, message, body?.error?.details);
 }

  return body as T;
}

