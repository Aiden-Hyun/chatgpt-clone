/**
 * Main error handler service for the unified error handling system
 */

import { ErrorCode, ErrorContext, ProcessedError, ERROR_CLASSIFICATIONS } from "./ErrorTypes";
import { ErrorMessageMapper } from "./ErrorMessageMapper";
import { ErrorLogger } from "./ErrorLogger";
import { getLogger } from "../logger";

export interface ErrorHandlerConfig {
  enableRecovery?: boolean;
  enableLogging?: boolean;
  defaultContext?: Partial<ErrorContext>;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private messageMapper: ErrorMessageMapper;
  private logger: ErrorLogger;
  private config: ErrorHandlerConfig;
  private centralizedLogger = getLogger("ErrorHandler");

  constructor(config: ErrorHandlerConfig = {}) {
    this.config = {
      enableRecovery: true,
      enableLogging: true,
      defaultContext: {},
      ...config,
    };
    this.messageMapper = new ErrorMessageMapper();
    this.logger = ErrorLogger.getInstance();
  }

  static getInstance(config?: ErrorHandlerConfig): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler(config);
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle an error and return a processed error object
   */
  async handle(
    error: unknown,
    context: Partial<ErrorContext> = {}
  ): Promise<ProcessedError> {
    const fullContext: ErrorContext = {
      operation: "unknown",
      timestamp: Date.now(),
      ...this.config.defaultContext,
      ...context,
    };

    const processedError = this.processError(error, fullContext);

    // Log the error if logging is enabled
    if (this.config.enableLogging) {
      await this.logger.log(processedError);
    }

    // Attempt recovery if enabled and error is retryable
    if (this.config.enableRecovery && processedError.isRetryable) {
      await this.attemptRecovery(processedError);
    }

    return processedError;
  }

  /**
   * Process and classify an error
   */
  private processError(error: unknown, context: ErrorContext): ProcessedError {
    const errorCode = this.classifyError(error);
    const classification = ERROR_CLASSIFICATIONS[errorCode];

    return {
      code: errorCode,
      message: classification.technicalMessage,
      userMessage: classification.userMessage,
      isRetryable: classification.isRetryable,
      severity: classification.severity,
      context,
      originalError: error,
      stack: error instanceof Error ? error.stack : undefined,
    };
  }

  /**
   * Classify an error and return the appropriate error code
   */
  private classifyError(error: unknown): ErrorCode {
    if (error instanceof Error) {
      return this.classifyErrorFromMessage(error.message, error.name);
    }

    if (typeof error === "string") {
      return this.classifyErrorFromMessage(error);
    }

    if (error && typeof error === "object") {
      // Handle Supabase errors
      if ("message" in error && typeof error.message === "string") {
        return this.classifyErrorFromMessage(error.message);
      }
      
      // Handle HTTP errors
      if ("status" in error && typeof error.status === "number") {
        return this.classifyHttpError(error.status);
      }
    }

    return ErrorCode.UNKNOWN_ERROR;
  }

  /**
   * Classify error based on error message
   */
  private classifyErrorFromMessage(message: string, name?: string): ErrorCode {
    const lowerMessage = message.toLowerCase();
    const lowerName = name?.toLowerCase() || "";

    // Network errors
    if (lowerMessage.includes("timeout") || lowerName.includes("timeout")) {
      return ErrorCode.NETWORK_TIMEOUT;
    }
    if (lowerMessage.includes("network") || lowerMessage.includes("connection")) {
      return ErrorCode.NETWORK_CONNECTION;
    }
    if (lowerMessage.includes("offline") || lowerMessage.includes("no internet")) {
      return ErrorCode.NETWORK_OFFLINE;
    }
    if (lowerMessage.includes("fetch") || lowerMessage.includes("request failed")) {
      return ErrorCode.NETWORK_REQUEST_FAILED;
    }

    // Authentication errors
    if (lowerMessage.includes("invalid credentials") || lowerMessage.includes("invalid email or password")) {
      return ErrorCode.AUTH_INVALID_CREDENTIALS;
    }
    if (lowerMessage.includes("session expired") || lowerMessage.includes("token expired")) {
      return ErrorCode.AUTH_SESSION_EXPIRED;
    }
    if (lowerMessage.includes("unauthorized") || lowerMessage.includes("access denied")) {
      return ErrorCode.AUTH_UNAUTHORIZED;
    }
    if (lowerMessage.includes("user not found") || lowerMessage.includes("email not found")) {
      return ErrorCode.AUTH_USER_NOT_FOUND;
    }
    if (lowerMessage.includes("email not confirmed") || lowerMessage.includes("confirm your email")) {
      return ErrorCode.AUTH_EMAIL_NOT_CONFIRMED;
    }
    if (lowerMessage.includes("weak password") || lowerMessage.includes("password too weak")) {
      return ErrorCode.AUTH_WEAK_PASSWORD;
    }
    if (lowerMessage.includes("email already exists") || lowerMessage.includes("already registered")) {
      return ErrorCode.AUTH_EMAIL_ALREADY_EXISTS;
    }

    // API errors
    if (lowerMessage.includes("rate limit") || lowerMessage.includes("too many requests")) {
      return ErrorCode.API_RATE_LIMIT;
    }
    if (lowerMessage.includes("server error") || lowerMessage.includes("internal server error")) {
      return ErrorCode.API_SERVER_ERROR;
    }
    if (lowerMessage.includes("validation") || lowerMessage.includes("invalid data")) {
      return ErrorCode.API_VALIDATION_ERROR;
    }
    if (lowerMessage.includes("forbidden") || lowerMessage.includes("permission denied")) {
      return ErrorCode.API_FORBIDDEN;
    }
    if (lowerMessage.includes("not found") || lowerMessage.includes("404")) {
      return ErrorCode.API_NOT_FOUND;
    }

    // Storage errors
    if (lowerMessage.includes("storage") || lowerMessage.includes("quota")) {
      return ErrorCode.STORAGE_ERROR;
    }
    if (lowerMessage.includes("quota exceeded")) {
      return ErrorCode.STORAGE_QUOTA_EXCEEDED;
    }
    if (lowerMessage.includes("permission denied") && lowerMessage.includes("storage")) {
      return ErrorCode.STORAGE_PERMISSION_DENIED;
    }

    // Business logic errors
    if (lowerMessage.includes("validation failed") || lowerMessage.includes("invalid input")) {
      return ErrorCode.VALIDATION_FAILED;
    }
    if (lowerMessage.includes("not supported") || lowerMessage.includes("unsupported")) {
      return ErrorCode.OPERATION_NOT_SUPPORTED;
    }
    if (lowerMessage.includes("insufficient permissions")) {
      return ErrorCode.INSUFFICIENT_PERMISSIONS;
    }
    if (lowerMessage.includes("resource not found")) {
      return ErrorCode.RESOURCE_NOT_FOUND;
    }
    if (lowerMessage.includes("cancelled") || lowerMessage.includes("aborted")) {
      return ErrorCode.OPERATION_CANCELLED;
    }

    return ErrorCode.UNKNOWN_ERROR;
  }

  /**
   * Classify HTTP status codes
   */
  private classifyHttpError(status: number): ErrorCode {
    switch (status) {
      case 400:
        return ErrorCode.API_VALIDATION_ERROR;
      case 401:
        return ErrorCode.AUTH_UNAUTHORIZED;
      case 403:
        return ErrorCode.API_FORBIDDEN;
      case 404:
        return ErrorCode.API_NOT_FOUND;
      case 408:
        return ErrorCode.API_TIMEOUT;
      case 429:
        return ErrorCode.API_RATE_LIMIT;
      case 500:
      case 502:
      case 503:
      case 504:
        return ErrorCode.API_SERVER_ERROR;
      default:
        return ErrorCode.UNKNOWN_ERROR;
    }
  }

  /**
   * Attempt error recovery (placeholder for future implementation)
   */
  private async attemptRecovery(error: ProcessedError): Promise<void> {
    // This is where you would implement recovery strategies
    // For example:
    // - Retry network requests
    // - Refresh authentication tokens
    // - Clear caches
    // - Fallback to alternative services
    
    if (__DEV__) {
      this.centralizedLogger.debug("🔄 Attempting recovery for error:", error.code);
    }
  }

  /**
   * Create a standardized error result object
   */
  createErrorResult(error: ProcessedError): { success: false; error: string; code: ErrorCode } {
    return {
      success: false,
      error: error.userMessage,
      code: error.code,
    };
  }

  /**
   * Create a standardized success result object
   */
  createSuccessResult<T>(data: T): { success: true; data: T; error: null } {
    return {
      success: true,
      data,
      error: null,
    };
  }

  /**
   * Handle an error and return a standardized result
   */
  async handleWithResult<T>(
    error: unknown,
    context: Partial<ErrorContext> = {}
  ): Promise<{ success: false; error: string; code: ErrorCode }> {
    const processedError = await this.handle(error, context);
    return this.createErrorResult(processedError);
  }
}
