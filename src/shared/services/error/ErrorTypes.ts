/**
 * Standardized error types and classifications for the unified error handling system
 */

export enum ErrorCode {
  // Network Errors
  NETWORK_TIMEOUT = "NETWORK_TIMEOUT",
  NETWORK_CONNECTION = "NETWORK_CONNECTION",
  NETWORK_OFFLINE = "NETWORK_OFFLINE",
  NETWORK_REQUEST_FAILED = "NETWORK_REQUEST_FAILED",

  // Authentication Errors
  AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS",
  AUTH_SESSION_EXPIRED = "AUTH_SESSION_EXPIRED",
  AUTH_UNAUTHORIZED = "AUTH_UNAUTHORIZED",
  AUTH_USER_NOT_FOUND = "AUTH_USER_NOT_FOUND",
  AUTH_EMAIL_NOT_CONFIRMED = "AUTH_EMAIL_NOT_CONFIRMED",
  AUTH_WEAK_PASSWORD = "AUTH_WEAK_PASSWORD",
  AUTH_EMAIL_ALREADY_EXISTS = "AUTH_EMAIL_ALREADY_EXISTS",

  // API Errors
  API_RATE_LIMIT = "API_RATE_LIMIT",
  API_SERVER_ERROR = "API_SERVER_ERROR",
  API_VALIDATION_ERROR = "API_VALIDATION_ERROR",
  API_FORBIDDEN = "API_FORBIDDEN",
  API_NOT_FOUND = "API_NOT_FOUND",
  API_TIMEOUT = "API_TIMEOUT",

  // Business Logic Errors
  VALIDATION_FAILED = "VALIDATION_FAILED",
  OPERATION_NOT_SUPPORTED = "OPERATION_NOT_SUPPORTED",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  OPERATION_CANCELLED = "OPERATION_CANCELLED",

  // Storage Errors
  STORAGE_ERROR = "STORAGE_ERROR",
  STORAGE_QUOTA_EXCEEDED = "STORAGE_QUOTA_EXCEEDED",
  STORAGE_PERMISSION_DENIED = "STORAGE_PERMISSION_DENIED",

  // System Errors
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
}

export type ErrorSeverity = "low" | "medium" | "high" | "critical";

export interface ErrorClassification {
  code: ErrorCode;
  isRetryable: boolean;
  severity: ErrorSeverity;
  userMessage: string;
  technicalMessage: string;
  category: "network" | "auth" | "api" | "business" | "storage" | "system";
}

export interface ErrorContext {
  operation: string;
  userId?: string;
  requestId?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
  service?: string;
  component?: string;
}

export interface ProcessedError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  isRetryable: boolean;
  severity: ErrorSeverity;
  context: ErrorContext;
  originalError?: unknown;
  stack?: string;
}

/**
 * Error classifications mapping
 */
export const ERROR_CLASSIFICATIONS: Record<ErrorCode, ErrorClassification> = {
  // Network Errors
  [ErrorCode.NETWORK_TIMEOUT]: {
    code: ErrorCode.NETWORK_TIMEOUT,
    isRetryable: true,
    severity: "medium",
    userMessage:
      "Request timed out. Please check your connection and try again.",
    technicalMessage: "Network request exceeded timeout threshold",
    category: "network",
  },
  [ErrorCode.NETWORK_CONNECTION]: {
    code: ErrorCode.NETWORK_CONNECTION,
    isRetryable: true,
    severity: "medium",
    userMessage: "Unable to connect. Please check your internet connection.",
    technicalMessage: "Network connection failed",
    category: "network",
  },
  [ErrorCode.NETWORK_OFFLINE]: {
    code: ErrorCode.NETWORK_OFFLINE,
    isRetryable: true,
    severity: "medium",
    userMessage:
      "You appear to be offline. Please check your internet connection.",
    technicalMessage: "Device is offline",
    category: "network",
  },
  [ErrorCode.NETWORK_REQUEST_FAILED]: {
    code: ErrorCode.NETWORK_REQUEST_FAILED,
    isRetryable: true,
    severity: "medium",
    userMessage: "Network request failed. Please try again.",
    technicalMessage: "Network request failed with unknown error",
    category: "network",
  },

  // Authentication Errors
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: {
    code: ErrorCode.AUTH_INVALID_CREDENTIALS,
    isRetryable: false,
    severity: "medium",
    userMessage: "Invalid email or password. Please try again.",
    technicalMessage: "Authentication failed with invalid credentials",
    category: "auth",
  },
  [ErrorCode.AUTH_SESSION_EXPIRED]: {
    code: ErrorCode.AUTH_SESSION_EXPIRED,
    isRetryable: false,
    severity: "medium",
    userMessage: "Your session has expired. Please sign in again.",
    technicalMessage: "User session has expired",
    category: "auth",
  },
  [ErrorCode.AUTH_UNAUTHORIZED]: {
    code: ErrorCode.AUTH_UNAUTHORIZED,
    isRetryable: false,
    severity: "high",
    userMessage: "You are not authorized to perform this action.",
    technicalMessage: "Unauthorized access attempt",
    category: "auth",
  },
  [ErrorCode.AUTH_USER_NOT_FOUND]: {
    code: ErrorCode.AUTH_USER_NOT_FOUND,
    isRetryable: false,
    severity: "medium",
    userMessage: "User account not found. Please check your email address.",
    technicalMessage: "User account does not exist",
    category: "auth",
  },
  [ErrorCode.AUTH_EMAIL_NOT_CONFIRMED]: {
    code: ErrorCode.AUTH_EMAIL_NOT_CONFIRMED,
    isRetryable: false,
    severity: "medium",
    userMessage: "Please confirm your email address before signing in.",
    technicalMessage: "User email address not confirmed",
    category: "auth",
  },
  [ErrorCode.AUTH_WEAK_PASSWORD]: {
    code: ErrorCode.AUTH_WEAK_PASSWORD,
    isRetryable: false,
    severity: "low",
    userMessage: "Password is too weak. Please choose a stronger password.",
    technicalMessage: "Password does not meet security requirements",
    category: "auth",
  },
  [ErrorCode.AUTH_EMAIL_ALREADY_EXISTS]: {
    code: ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
    isRetryable: false,
    severity: "low",
    userMessage:
      "An account with this email already exists. Please sign in instead.",
    technicalMessage: "Email address is already registered",
    category: "auth",
  },

  // API Errors
  [ErrorCode.API_RATE_LIMIT]: {
    code: ErrorCode.API_RATE_LIMIT,
    isRetryable: true,
    severity: "medium",
    userMessage: "Too many requests. Please wait a moment and try again.",
    technicalMessage: "API rate limit exceeded",
    category: "api",
  },
  [ErrorCode.API_SERVER_ERROR]: {
    code: ErrorCode.API_SERVER_ERROR,
    isRetryable: true,
    severity: "high",
    userMessage: "Server error occurred. Please try again later.",
    technicalMessage: "Internal server error",
    category: "api",
  },
  [ErrorCode.API_VALIDATION_ERROR]: {
    code: ErrorCode.API_VALIDATION_ERROR,
    isRetryable: false,
    severity: "low",
    userMessage:
      "Invalid data provided. Please check your input and try again.",
    technicalMessage: "API validation failed",
    category: "api",
  },
  [ErrorCode.API_FORBIDDEN]: {
    code: ErrorCode.API_FORBIDDEN,
    isRetryable: false,
    severity: "high",
    userMessage:
      "Access denied. You do not have permission to perform this action.",
    technicalMessage: "API access forbidden",
    category: "api",
  },
  [ErrorCode.API_NOT_FOUND]: {
    code: ErrorCode.API_NOT_FOUND,
    isRetryable: false,
    severity: "medium",
    userMessage: "The requested resource was not found.",
    technicalMessage: "API resource not found",
    category: "api",
  },
  [ErrorCode.API_TIMEOUT]: {
    code: ErrorCode.API_TIMEOUT,
    isRetryable: true,
    severity: "medium",
    userMessage: "Request timed out. Please try again.",
    technicalMessage: "API request timeout",
    category: "api",
  },

  // Business Logic Errors
  [ErrorCode.VALIDATION_FAILED]: {
    code: ErrorCode.VALIDATION_FAILED,
    isRetryable: false,
    severity: "low",
    userMessage: "Please check your input and try again.",
    technicalMessage: "Input validation failed",
    category: "business",
  },
  [ErrorCode.OPERATION_NOT_SUPPORTED]: {
    code: ErrorCode.OPERATION_NOT_SUPPORTED,
    isRetryable: false,
    severity: "medium",
    userMessage: "This operation is not supported.",
    technicalMessage: "Operation not supported",
    category: "business",
  },
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: {
    code: ErrorCode.INSUFFICIENT_PERMISSIONS,
    isRetryable: false,
    severity: "high",
    userMessage: "You do not have sufficient permissions for this action.",
    technicalMessage: "Insufficient permissions",
    category: "business",
  },
  [ErrorCode.RESOURCE_NOT_FOUND]: {
    code: ErrorCode.RESOURCE_NOT_FOUND,
    isRetryable: false,
    severity: "medium",
    userMessage: "The requested resource was not found.",
    technicalMessage: "Resource not found",
    category: "business",
  },
  [ErrorCode.OPERATION_CANCELLED]: {
    code: ErrorCode.OPERATION_CANCELLED,
    isRetryable: false,
    severity: "low",
    userMessage: "Operation was cancelled.",
    technicalMessage: "Operation cancelled by user or system",
    category: "business",
  },

  // Storage Errors
  [ErrorCode.STORAGE_ERROR]: {
    code: ErrorCode.STORAGE_ERROR,
    isRetryable: true,
    severity: "medium",
    userMessage: "Storage error occurred. Please try again.",
    technicalMessage: "Storage operation failed",
    category: "storage",
  },
  [ErrorCode.STORAGE_QUOTA_EXCEEDED]: {
    code: ErrorCode.STORAGE_QUOTA_EXCEEDED,
    isRetryable: false,
    severity: "high",
    userMessage: "Storage quota exceeded. Please free up some space.",
    technicalMessage: "Storage quota exceeded",
    category: "storage",
  },
  [ErrorCode.STORAGE_PERMISSION_DENIED]: {
    code: ErrorCode.STORAGE_PERMISSION_DENIED,
    isRetryable: false,
    severity: "high",
    userMessage:
      "Storage permission denied. Please check your device settings.",
    technicalMessage: "Storage permission denied",
    category: "storage",
  },

  // System Errors
  [ErrorCode.UNKNOWN_ERROR]: {
    code: ErrorCode.UNKNOWN_ERROR,
    isRetryable: false,
    severity: "medium",
    userMessage: "Something went wrong. Please try again.",
    technicalMessage: "Unknown error occurred",
    category: "system",
  },
  [ErrorCode.INTERNAL_ERROR]: {
    code: ErrorCode.INTERNAL_ERROR,
    isRetryable: false,
    severity: "critical",
    userMessage: "An internal error occurred. Please try again later.",
    technicalMessage: "Internal system error",
    category: "system",
  },
  [ErrorCode.CONFIGURATION_ERROR]: {
    code: ErrorCode.CONFIGURATION_ERROR,
    isRetryable: false,
    severity: "critical",
    userMessage: "Configuration error. Please contact support.",
    technicalMessage: "System configuration error",
    category: "system",
  },
};
