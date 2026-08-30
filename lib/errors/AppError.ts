  import { ErrorCode } from "./errorCodes";
  import { ERROR_CONFIG } from "./errorConfig";

  /**
   * Standardized error class for the entire application.
   * All business logic errors should be thrown as AppError instances.
   *
   * Usage:
   *   throw new AppError(ErrorCode.USER_EXISTS, "Email already in use");
   *   throw new AppError(ErrorCode.RESTAURANT_NOT_FOUND);
   */
  export class AppError extends Error {
    code: ErrorCode;
    message: string;
    status: number;
    details?: unknown;

    constructor(code: ErrorCode, customMessage?: string, details?: unknown) {
      const config = ERROR_CONFIG[code];

      if (!config) {
        throw new Error(`Invalid error code: ${code}`);
      }

      const message = customMessage || config.message;
      super(message);
      this.name = "AppError";
      this.code = code;
      this.message = message;
      this.status = config.status;
      this.details = details;

      // Maintain proper stack trace
      Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Convert error to JSON for API response
     */
    toJSON() {
      return {
        error: {
          code: this.code,
          message: this.message,
          ...(process.env.NODE_ENV === "development" && {
            details: this.details,
            stack: this.stack,
          }),
        },
      };
    }
  }


