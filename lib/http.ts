// Thin wrapper around fetch. Every service module calls through this so
// error handling, headers, and JSON parsing are defined in exactly one
// place instead of being copy-pasted into every component.

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
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
    throw new ApiError(body?.error ?? "Request failed", response.status);
  }

  return body as T;
}

// Small helper so callers/UI code can show a friendly message regardless of
// what kind of error was thrown.
export function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
