import { LogLevel, LogLevelString } from "./LogLevel";

/**
 * Centralized logging service for the application
 * Provides consistent logging with proper levels and formatting
 */
export class Logger {
  private static instance: Logger;
  private isDevelopment = __DEV__;
  private logLevel: LogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.ERROR;
  private context?: string;
  private showFullPath: boolean = false;
  private showFileInfo: boolean = true; // Enable file info by default

  private constructor(context?: string) {
    this.context = context;
  }

  /**
   * Get singleton instance of the logger
   */
  static getInstance(context?: string): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(context);
    }
    return Logger.instance;
  }

  /**
   * Set the minimum log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Set whether to show full file paths in logs
   */
  setShowFullPath(show: boolean): void {
    this.showFullPath = show;
  }

  /**
   * Set whether to show file information in logs (useful for React Native/Expo)
   */
  setShowFileInfo(show: boolean): void {
    this.showFileInfo = show;
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  /**
   * Format file path for display (extract relative path from absolute)
   */
  private formatFilePath(filePath: string): string {
    if (!filePath || filePath === "unknown") return "unknown";

    // Extract relative path from absolute path
    // Use a fallback for React Native/Expo environments where process.cwd() isn't available
    let projectRoot: string;
    try {
      projectRoot =
        typeof process !== "undefined" && process.cwd ? process.cwd() : "";
    } catch {
      projectRoot = "";
    }

    if (projectRoot && filePath.startsWith(projectRoot)) {
      const relativePath = filePath.substring(projectRoot.length + 1);
      return relativePath;
    }

    // If it's already relative or we can't determine project root, return as-is
    return filePath;
  }

  /**
   * Format log message with message first, then metadata
   */
  private formatMessage(
    level: LogLevelString,
    message: string,
    filePath?: string,
    lineNumber?: number
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = this.context ? `[${this.context}]` : "";

    // Use explicit file path if available, otherwise try to get caller info
    let callerStr = "";
    if (this.showFileInfo) {
      if ((this as any).filePath) {
        callerStr = `[${(this as any).filePath}]`;
      } else if (filePath && lineNumber) {
        const formattedPath = this.formatFilePath(filePath);
        callerStr = `[${formattedPath}:${lineNumber}]`;
      }
    }

    // Format: MESSAGE | [LEVEL] [CONTEXT] [FILE:LINE] [TIMESTAMP]
    const metadata = [
      `[${level.toUpperCase()}]`,
      contextStr,
      callerStr,
      `[${timestamp}]`,
    ]
      .filter(Boolean)
      .join(" ");

    return `${message} | ${metadata}`;
  }

  /**
   * Debug level logging - only in development
   */
  debug(
    filePath: string,
    lineNumber: number,
    message: string,
    data?: any
  ): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formattedMessage = this.formatMessage(
        "debug",
        message,
        filePath,
        lineNumber
      );
      // Use console directly to avoid circular dependency
      console.log(formattedMessage, data || "");
    }
  }

  /**
   * Info level logging
   */
  info(
    filePath: string,
    lineNumber: number,
    message: string,
    data?: any
  ): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formattedMessage = this.formatMessage(
        "info",
        message,
        filePath,
        lineNumber
      );
      // Use console directly to avoid circular dependency
      console.info(formattedMessage, data || "");
    }
  }

  /**
   * Warning level logging
   */
  warn(
    filePath: string,
    lineNumber: number,
    message: string,
    data?: any
  ): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formattedMessage = this.formatMessage(
        "warn",
        message,
        filePath,
        lineNumber
      );
      // Use console directly to avoid circular dependency
      console.warn(formattedMessage, data || "");
    }
  }

  /**
   * Error level logging
   */
  error(
    filePath: string,
    lineNumber: number,
    message: string,
    data?: any
  ): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formattedMessage = this.formatMessage(
        "error",
        message,
        filePath,
        lineNumber
      );
      // Use console directly to avoid circular dependency
      console.error(formattedMessage, data || "");
    }
  }

  /**
   * Create a new logger instance with a specific context
   */
  withContext(context: string): Logger {
    return new Logger(context);
  }

  /**
   * Create a new logger instance with file context for better debugging
   */
  static withFile(filePath: string, context?: string): Logger {
    const logger = new Logger(context);
    // Store the file path for this logger instance
    (logger as any).filePath = filePath;
    return logger;
  }
}

// Convenience function to get a logger instance
export const getLogger = (context?: string) => Logger.getInstance(context);

// Convenience function to get a logger with explicit file path
export const getLoggerWithFile = (filePath: string, context?: string) =>
  Logger.withFile(filePath, context);

// Convenience functions for global logger configuration
export const setLogLevel = (level: LogLevel) => {
  Logger.getInstance().setLogLevel(level);
};

export const setShowFullPath = (show: boolean) => {
  Logger.getInstance().setShowFullPath(show);
};

export const setShowFileInfo = (show: boolean) => {
  Logger.getInstance().setShowFileInfo(show);
};
