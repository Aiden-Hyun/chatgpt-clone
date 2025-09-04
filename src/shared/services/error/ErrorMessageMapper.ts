/**
 * Error message mapper for converting technical errors to user-friendly messages
 */

import { ERROR_CLASSIFICATIONS, ErrorCode } from "./ErrorTypes";

export class ErrorMessageMapper {
  /**
   * Get user-friendly error message for a given error code
   */
  getUserMessage(code: ErrorCode): string {
    return (
      ERROR_CLASSIFICATIONS[code]?.userMessage ||
      ERROR_CLASSIFICATIONS[ErrorCode.UNKNOWN_ERROR].userMessage
    );
  }

  /**
   * Get technical error message for a given error code
   */
  getTechnicalMessage(code: ErrorCode): string {
    return (
      ERROR_CLASSIFICATIONS[code]?.technicalMessage ||
      ERROR_CLASSIFICATIONS[ErrorCode.UNKNOWN_ERROR].technicalMessage
    );
  }

  /**
   * Check if an error code is retryable
   */
  isRetryable(code: ErrorCode): boolean {
    return ERROR_CLASSIFICATIONS[code]?.isRetryable || false;
  }

  /**
   * Get error severity for a given error code
   */
  getSeverity(code: ErrorCode): "low" | "medium" | "high" | "critical" {
    return ERROR_CLASSIFICATIONS[code]?.severity || "medium";
  }

  /**
   * Get error category for a given error code
   */
  getCategory(
    code: ErrorCode
  ): "network" | "auth" | "api" | "business" | "storage" | "system" {
    return ERROR_CLASSIFICATIONS[code]?.category || "system";
  }

  /**
   * Get all error codes for a specific category
   */
  getErrorCodesByCategory(
    category: "network" | "auth" | "api" | "business" | "storage" | "system"
  ): ErrorCode[] {
    return Object.values(ErrorCode).filter(
      (code) => ERROR_CLASSIFICATIONS[code]?.category === category
    );
  }

  /**
   * Get all retryable error codes
   */
  getRetryableErrorCodes(): ErrorCode[] {
    return Object.values(ErrorCode).filter(
      (code) => ERROR_CLASSIFICATIONS[code]?.isRetryable
    );
  }

  /**
   * Get all error codes by severity
   */
  getErrorCodesBySeverity(
    severity: "low" | "medium" | "high" | "critical"
  ): ErrorCode[] {
    return Object.values(ErrorCode).filter(
      (code) => ERROR_CLASSIFICATIONS[code]?.severity === severity
    );
  }
}
