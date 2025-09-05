/**
 * Centralized error logging service for the unified error handling system
 */

import { ProcessedError } from "./ErrorTypes";
import { getLogger } from "../logger";

export interface LogEntry {
  timestamp: string;
  code: string;
  message: string;
  userMessage: string;
  severity: "low" | "medium" | "high" | "critical";
  context: {
    operation: string;
    userId?: string;
    requestId?: string;
    service?: string;
    component?: string;
    metadata?: Record<string, unknown>;
  };
  stack?: string;
  originalError?: unknown;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private isDev = typeof __DEV__ !== "undefined" && __DEV__;
  private logger = getLogger("ErrorLogger");

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log a processed error
   */
  async log(error: ProcessedError): Promise<void> {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      severity: error.severity,
      context: {
        operation: error.context.operation,
        userId: error.context.userId,
        requestId: error.context.requestId,
        service: error.context.service,
        component: error.context.component,
        metadata: error.context.metadata,
      },
      stack: error.stack,
      originalError: error.originalError,
    };

    // Console logging for development
    if (this.isDev) {
      this.logToConsole(logEntry);
    }

    // Production logging (could integrate with external services)
    if (!this.isDev) {
      await this.sendToLoggingService(logEntry);
    }
  }

  /**
   * Log to console with appropriate formatting
   */
  private logToConsole(logEntry: LogEntry): void {
    const { timestamp, code, message, severity, context } = logEntry;
    const severityEmoji = this.getSeverityEmoji(severity);
    const contextInfo = this.formatContext(context);

    const logMessage = `${severityEmoji} [${timestamp}] ${code}: ${message}`;
    const logData = {
      userMessage: logEntry.userMessage,
      context: contextInfo,
      stack: logEntry.stack,
    };

    switch (severity) {
      case "critical":
        this.logger.error(logMessage, logData);
        break;
      case "high":
        this.logger.error(logMessage, logData);
        break;
      case "medium":
        this.logger.warn(logMessage, logData);
        break;
      case "low":
        this.logger.info(logMessage, logData);
        break;
    }
  }

  /**
   * Get emoji for severity level
   */
  private getSeverityEmoji(severity: "low" | "medium" | "high" | "critical"): string {
    switch (severity) {
      case "critical":
        return "🚨";
      case "high":
        return "⚠️";
      case "medium":
        return "⚠️";
      case "low":
        return "ℹ️";
    }
  }

  /**
   * Format context for logging
   */
  private formatContext(context: LogEntry["context"]): Record<string, unknown> {
    const formatted: Record<string, unknown> = {};

    if (context.operation) formatted.operation = context.operation;
    if (context.userId) formatted.userId = context.userId;
    if (context.requestId) formatted.requestId = context.requestId;
    if (context.service) formatted.service = context.service;
    if (context.component) formatted.component = context.component;
    if (context.metadata) formatted.metadata = context.metadata;

    return formatted;
  }

  /**
   * Send to external logging service (for production)
   */
  private async sendToLoggingService(logEntry: LogEntry): Promise<void> {
    try {
      // In a real application, you would integrate with services like:
      // - Sentry
      // - LogRocket
      // - DataDog
      // - Custom logging API
      
      // For now, we'll just store in a simple format
      // In production, you might want to batch these or send them asynchronously
      
      if (logEntry.severity === "critical" || logEntry.severity === "high") {
        // Critical and high severity errors should be sent immediately
        await this.sendCriticalError(logEntry);
      } else {
        // Lower severity errors can be batched
        await this.batchError(logEntry);
      }
    } catch (loggingError) {
      // Fallback to console if external logging fails
      this.logger.error("Failed to send error to logging service:", loggingError);
      this.logToConsole(logEntry);
    }
  }

  /**
   * Send critical errors immediately
   */
  private async sendCriticalError(logEntry: LogEntry): Promise<void> {
    // Implementation would depend on your chosen logging service
    // Example for a REST API:
    /*
    await fetch('/api/logs/critical', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    });
    */
    
    // For now, just log to console
    this.logger.error("CRITICAL ERROR:", logEntry);
  }

  /**
   * Batch lower severity errors
   */
  private async batchError(logEntry: LogEntry): Promise<void> {
    // Implementation would depend on your chosen logging service
    // You might want to implement a batching mechanism here
    
    // For now, just log to console
    this.logger.warn("BATCHED ERROR:", logEntry);
  }

  /**
   * Log a simple error message (convenience method)
   */
  async logSimple(
    message: string,
    severity: "low" | "medium" | "high" | "critical" = "medium",
    context?: Partial<LogEntry["context"]>
  ): Promise<void> {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      code: "SIMPLE_ERROR",
      message,
      userMessage: message,
      severity,
      context: {
        operation: context?.operation || "unknown",
        ...context,
      },
    };

    await this.log({
      code: "SIMPLE_ERROR" as any,
      message,
      userMessage: message,
      isRetryable: false,
      severity,
      context: {
        operation: context?.operation || "unknown",
        timestamp: Date.now(),
        ...context,
      },
    });
  }
}
