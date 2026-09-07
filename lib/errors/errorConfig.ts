import { ErrorCode } from "./errorCodes";

/**
 * Maps each ErrorCode to its HTTP status code and default user-friendly message.
 * This is the single source of truth for error-to-HTTP mappings.
 */
export const ERROR_CONFIG: Record<
  ErrorCode,
  { status: number; message: string }
> = {
  // Authentication (401)
  [ErrorCode.UNAUTHORIZED]: {
    status: 401,
    message: "Please sign in to continue",
  },
  [ErrorCode.INVALID_CREDENTIALS]: {
    status: 401,
    message: "Email or password is incorrect",
  },
  [ErrorCode.TOKEN_EXPIRED]: {
    status: 401,
    message: "Your session has expired. Please sign in again",
  },

  // Authorization (403)
  [ErrorCode.FORBIDDEN]: {
    status: 403,
    message: "You do not have permission to perform this action",
  },
  [ErrorCode.OWNER_ACCESS_REQUIRED]: {
    status: 403,
    message: "This feature is only available for restaurant owners",
  },
  [ErrorCode.RIDER_ACCESS_REQUIRED]: {
    status: 403,
    message: "This feature is only available for delivery riders",
  },
  [ErrorCode.ADMIN_ACCESS_REQUIRED]: {
    status: 403,
    message: "This feature is only available for administrators",
  },

  // Validation (400)
  [ErrorCode.INVALID_INPUT]: {
    status: 400,
    message: "The provided information is invalid",
  },
  [ErrorCode.MISSING_FIELD]: {
    status: 400,
    message: "Please fill in all required fields",
  },
  [ErrorCode.INVALID_ROLE]: {
    status: 400,
    message: "Invalid account role selected",
  },
  [ErrorCode.INVALID_PHONE]: {
    status: 400,
    message: "Please provide a valid phone number",
  },
  [ErrorCode.INVALID_EMAIL]: {
    status: 400,
    message: "Please provide a valid email address",
  },
  [ErrorCode.INVALID_QUANTITY]: {
    status: 400,
    message: "Quantity must be greater than 0",
  },

  // Conflicts (409)
  [ErrorCode.USER_EXISTS]: {
    status: 409,
    message: "An account with this email already exists",
  },
  [ErrorCode.EMAIL_EXISTS]: {
    status: 409,
    message: "This email is already registered",
  },
  [ErrorCode.PHONE_EXISTS]: {
    status: 409,
    message: "This phone number is already registered",
  },
  [ErrorCode.RESTAURANT_EXISTS]: {
    status: 409,
    message: "A restaurant with this name already exists",
  },

  // Not Found (404)
  [ErrorCode.USER_NOT_FOUND]: {
    status: 404,
    message: "User not found",
  },
  [ErrorCode.RESTAURANT_NOT_FOUND]: {
    status: 404,
    message: "Restaurant not found",
  },
  [ErrorCode.MENU_ITEM_NOT_FOUND]: {
    status: 404,
    message: "Menu item not found",
  },
  [ErrorCode.CATEGORY_NOT_FOUND]: {
    status: 404,
    message: "Category not found",
  },
  [ErrorCode.ORDER_NOT_FOUND]: {
    status: 404,
    message: "Order not found",
  },
  [ErrorCode.CART_NOT_FOUND]: {
    status: 404,
    message: "Cart not found",
  },
  [ErrorCode.RIDER_NOT_FOUND]: {
    status: 404,
    message: "Rider not found",
  },

  // Ownership (404 or 403)
  [ErrorCode.NOT_RESTAURANT_OWNER]: {
    status: 403,
    message: "You do not own this restaurant",
  },
  [ErrorCode.NOT_ORDER_OWNER]: {
    status: 403,
    message: "You do not own this order",
  },
  [ErrorCode.NOT_CART_OWNER]: {
    status: 403,
    message: "You do not have access to this cart",
  },

  // Server errors (500)
  [ErrorCode.DATABASE_ERROR]: {
    status: 500,
    message: "A database error occurred. Please try again later",
  },
  [ErrorCode.INTERNAL_ERROR]: {
    status: 500,
    message: "An unexpected error occurred. Please try again later",
  },
};
