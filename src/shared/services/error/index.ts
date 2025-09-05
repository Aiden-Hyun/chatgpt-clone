/**
 * Unified Error Handling System
 *
 * This module provides a comprehensive error handling solution for the application,
 * including standardized error types, centralized logging, and recovery strategies.
 */

// Core types and enums
// Import classes for singleton creation
import { ErrorHandler, ErrorHandlerConfig } from "./ErrorHandler";
import { ErrorMessageMapper } from "./ErrorMessageMapper";
import { ErrorRecoveryManager } from "./ErrorRecovery";

export {
  ERROR_CLASSIFICATIONS,
  ErrorClassification,
  ErrorCode,
  ErrorContext,
  ErrorSeverity,
  ProcessedError,
} from "./ErrorTypes";

// Services
export { ErrorHandler, ErrorHandlerConfig } from "./ErrorHandler";
export { ErrorMessageMapper } from "./ErrorMessageMapper";
export {
  AuthRecoveryStrategy,
  ErrorRecoveryManager,
  NetworkRecoveryStrategy,
  RateLimitRecoveryStrategy,
  RecoveryResult,
  RecoveryStrategy,
  StorageRecoveryStrategy,
} from "./ErrorRecovery";

// Convenience exports
export { ErrorHandler as default } from "./ErrorHandler";

// Factory function for easy initialization
export const createErrorHandler = (config?: ErrorHandlerConfig) => {
  return ErrorHandler.getInstance(config);
};

// Quick access to singleton instances
export const errorHandler = ErrorHandler.getInstance();
// export const errorLogger = ErrorLogger.getInstance();
export const errorMessageMapper = new ErrorMessageMapper();
export const errorRecoveryManager = new ErrorRecoveryManager();
