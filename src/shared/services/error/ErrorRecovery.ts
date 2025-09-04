/**
 * Error recovery strategies for the unified error handling system
 */

import { ProcessedError, ErrorCode } from "./ErrorTypes";
import { ErrorLogger } from "./ErrorLogger";

export interface RecoveryStrategy {
  canRecover(error: ProcessedError): boolean;
  recover(error: ProcessedError): Promise<boolean>;
  getRecoveryMessage(error: ProcessedError): string;
}

export interface RecoveryResult {
  success: boolean;
  message: string;
  retryAfter?: number; // milliseconds
}

export class NetworkRecoveryStrategy implements RecoveryStrategy {
  private logger = ErrorLogger.getInstance();

  canRecover(error: ProcessedError): boolean {
    return [
      ErrorCode.NETWORK_TIMEOUT,
      ErrorCode.NETWORK_CONNECTION,
      ErrorCode.NETWORK_REQUEST_FAILED,
      ErrorCode.API_TIMEOUT,
      ErrorCode.API_SERVER_ERROR,
    ].includes(error.code);
  }

  async recover(error: ProcessedError): Promise<boolean> {
    try {
      // Check if device is online
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await this.logger.logSimple(
          "Device is offline, cannot recover network error",
          "medium",
          { operation: "network_recovery" }
        );
        return false;
      }

      // For network errors, we can attempt a simple connectivity test
      const isConnected = await this.testConnectivity();
      
      if (isConnected) {
        await this.logger.logSimple(
          "Network connectivity restored",
          "low",
          { operation: "network_recovery" }
        );
        return true;
      }

      return false;
    } catch (recoveryError) {
      await this.logger.logSimple(
        `Network recovery failed: ${recoveryError}`,
        "medium",
        { operation: "network_recovery" }
      );
      return false;
    }
  }

  getRecoveryMessage(error: ProcessedError): string {
    return "Network connection restored. You can try your request again.";
  }

  private async testConnectivity(): Promise<boolean> {
    try {
      // Simple connectivity test - try to fetch a small resource
      const response = await fetch("/favicon.ico", {
        method: "HEAD",
        cache: "no-cache",
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export class AuthRecoveryStrategy implements RecoveryStrategy {
  private logger = ErrorLogger.getInstance();

  canRecover(error: ProcessedError): boolean {
    return error.code === ErrorCode.AUTH_SESSION_EXPIRED;
  }

  async recover(error: ProcessedError): Promise<boolean> {
    try {
      // For session expired errors, we could attempt to refresh the token
      // This would depend on your authentication implementation
      
      // For now, we'll just log that recovery was attempted
      await this.logger.logSimple(
        "Session expired, user needs to re-authenticate",
        "medium",
        { operation: "auth_recovery" }
      );
      
      // In a real implementation, you might:
      // 1. Try to refresh the access token
      // 2. Redirect to login page
      // 3. Show a re-authentication modal
      
      return false; // Session recovery typically requires user action
    } catch (recoveryError) {
      await this.logger.logSimple(
        `Auth recovery failed: ${recoveryError}`,
        "medium",
        { operation: "auth_recovery" }
      );
      return false;
    }
  }

  getRecoveryMessage(error: ProcessedError): string {
    return "Your session has expired. Please sign in again.";
  }
}

export class RateLimitRecoveryStrategy implements RecoveryStrategy {
  private logger = ErrorLogger.getInstance();

  canRecover(error: ProcessedError): boolean {
    return error.code === ErrorCode.API_RATE_LIMIT;
  }

  async recover(error: ProcessedError): Promise<boolean> {
    try {
      // For rate limit errors, we can wait and retry
      const waitTime = this.calculateWaitTime(error);
      
      await this.logger.logSimple(
        `Rate limit hit, waiting ${waitTime}ms before retry`,
        "low",
        { operation: "rate_limit_recovery" }
      );

      // Wait for the calculated time
      await this.delay(waitTime);
      
      return true; // Ready to retry
    } catch (recoveryError) {
      await this.logger.logSimple(
        `Rate limit recovery failed: ${recoveryError}`,
        "medium",
        { operation: "rate_limit_recovery" }
      );
      return false;
    }
  }

  getRecoveryMessage(error: ProcessedError): string {
    return "Rate limit reached. Please wait a moment and try again.";
  }

  private calculateWaitTime(error: ProcessedError): number {
    // Default wait time for rate limits (in milliseconds)
    // In a real implementation, you might parse this from error headers
    return 1000; // 1 second
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class StorageRecoveryStrategy implements RecoveryStrategy {
  private logger = ErrorLogger.getInstance();

  canRecover(error: ProcessedError): boolean {
    return [
      ErrorCode.STORAGE_ERROR,
      ErrorCode.STORAGE_QUOTA_EXCEEDED,
    ].includes(error.code);
  }

  async recover(error: ProcessedError): Promise<boolean> {
    try {
      if (error.code === ErrorCode.STORAGE_QUOTA_EXCEEDED) {
        // For quota exceeded, we could try to clear some cache
        await this.clearCache();
        
        await this.logger.logSimple(
          "Storage quota exceeded, cleared cache",
          "medium",
          { operation: "storage_recovery" }
        );
        
        return true;
      }

      if (error.code === ErrorCode.STORAGE_ERROR) {
        // For general storage errors, we could try to reinitialize storage
        await this.reinitializeStorage();
        
        await this.logger.logSimple(
          "Storage error, reinitialized storage",
          "medium",
          { operation: "storage_recovery" }
        );
        
        return true;
      }

      return false;
    } catch (recoveryError) {
      await this.logger.logSimple(
        `Storage recovery failed: ${recoveryError}`,
        "medium",
        { operation: "storage_recovery" }
      );
      return false;
    }
  }

  getRecoveryMessage(error: ProcessedError): string {
    if (error.code === ErrorCode.STORAGE_QUOTA_EXCEEDED) {
      return "Storage space freed up. You can try your request again.";
    }
    return "Storage issue resolved. You can try your request again.";
  }

  private async clearCache(): Promise<void> {
    // Implementation would depend on your storage solution
    // This is a placeholder
    if (typeof localStorage !== "undefined") {
      // Clear non-essential cache items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("cache_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }

  private async reinitializeStorage(): Promise<void> {
    // Implementation would depend on your storage solution
    // This is a placeholder for storage reinitialization
  }
}

export class ErrorRecoveryManager {
  private strategies: RecoveryStrategy[] = [];
  private logger = ErrorLogger.getInstance();

  constructor() {
    this.strategies = [
      new NetworkRecoveryStrategy(),
      new AuthRecoveryStrategy(),
      new RateLimitRecoveryStrategy(),
      new StorageRecoveryStrategy(),
    ];
  }

  /**
   * Attempt to recover from an error
   */
  async attemptRecovery(error: ProcessedError): Promise<RecoveryResult> {
    const strategy = this.strategies.find(s => s.canRecover(error));
    
    if (!strategy) {
      return {
        success: false,
        message: "No recovery strategy available for this error type.",
      };
    }

    try {
      const recovered = await strategy.recover(error);
      
      if (recovered) {
        return {
          success: true,
          message: strategy.getRecoveryMessage(error),
        };
      } else {
        return {
          success: false,
          message: strategy.getRecoveryMessage(error),
        };
      }
    } catch (recoveryError) {
      await this.logger.logSimple(
        `Recovery attempt failed: ${recoveryError}`,
        "medium",
        { operation: "error_recovery" }
      );
      
      return {
        success: false,
        message: "Recovery attempt failed. Please try again later.",
      };
    }
  }

  /**
   * Add a custom recovery strategy
   */
  addStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy);
  }

  /**
   * Remove a recovery strategy
   */
  removeStrategy(strategy: RecoveryStrategy): void {
    const index = this.strategies.indexOf(strategy);
    if (index > -1) {
      this.strategies.splice(index, 1);
    }
  }
}
