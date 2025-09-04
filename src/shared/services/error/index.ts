/**
 * Unified Error Handling System
 * 
 * This module provides a comprehensive error handling solution for the application,
 * including standardized error types, centralized logging, and recovery strategies.
 */

// Core types and enums
export {
  ErrorCode,
  ErrorSeverity,
  ErrorClassification,
  ErrorContext,
  ProcessedError,
  ERROR_CLASSIFICATIONS,
} from "./ErrorTypes";

// Services
export { ErrorHandler, ErrorHandlerConfig } from "./ErrorHandler";
export { ErrorMessageMapper } from "./ErrorMessageMapper";
export { ErrorLogger, LogEntry } from "./ErrorLogger";
export {
  ErrorRecoveryManager,
  RecoveryStrategy,
  RecoveryResult,
  NetworkRecoveryStrategy,
  AuthRecoveryStrategy,
  RateLimitRecoveryStrategy,
  StorageRecoveryStrategy,
} from "./ErrorRecovery";

// Import classes for singleton creation
import { ErrorHandler, ErrorHandlerConfig } from "./ErrorHandler";
import { ErrorMessageMapper } from "./ErrorMessageMapper";
import { ErrorLogger } from "./ErrorLogger";
import { ErrorRecoveryManager } from "./ErrorRecovery";

// Convenience exports
export { ErrorHandler as default } from "./ErrorHandler";

// Factory function for easy initialization
export const createErrorHandler = (config?: ErrorHandlerConfig) => {
  return ErrorHandler.getInstance(config);
};

// Quick access to singleton instances
export const errorHandler = ErrorHandler.getInstance();
export const errorLogger = ErrorLogger.getInstance();
export const errorMessageMapper = new ErrorMessageMapper();
export const errorRecoveryManager = new ErrorRecoveryManager();
