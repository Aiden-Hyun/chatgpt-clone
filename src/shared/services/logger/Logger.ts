import { LogLevel, LogLevelString } from "./LogLevel";

/**
 * Centralized logging service for the application
 * Provides consistent logging with proper levels and formatting
 */
export class Logger {
  private static instances: Map<string, Logger> = new Map();
  private static headerPrinted = false;
  private static lineCounter = 0;
  private isDevelopment = __DEV__;
  private logLevel: LogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.ERROR;
  private context?: string;
  private showFullPath: boolean = false;
  private showFileInfo: boolean = true; // Enable file info by default

  private constructor(context?: string) {
    this.context = context;
  }

  /**
   * Get logger instance for a specific context
   */
  static getInstance(context?: string): Logger {
    const contextKey = context || "default";

    if (!Logger.instances.has(contextKey)) {
      Logger.instances.set(contextKey, new Logger(context));
    }

    return Logger.instances.get(contextKey)!;
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

    // If it's already relative, return as-is
    if (!filePath.startsWith("/")) {
      return filePath;
    }

    // Try multiple strategies to find the project root
    const possibleRoots = [
      // Strategy 1: Use process.cwd() if available
      (() => {
        try {
          return typeof process !== "undefined" && process.cwd
            ? process.cwd()
            : "";
        } catch {
          return "";
        }
      })(),

      // Strategy 2: Look for common project indicators in the path
      (() => {
        const parts = filePath.split("/");
        const srcIndex = parts.indexOf("src");
        if (srcIndex > 0) {
          return parts.slice(0, srcIndex).join("/");
        }
        return "";
      })(),

      // Strategy 3: Look for package.json or other project files
      (() => {
        const parts = filePath.split("/");
        for (let i = parts.length - 1; i >= 0; i--) {
          const testPath = parts.slice(0, i).join("/");
          // This is a heuristic - in a real app, you might check for actual files
          if (testPath.includes("chatgpt-clone") || testPath.includes("src")) {
            return testPath;
          }
        }
        return "";
      })(),
    ];

    // Try each strategy to find a matching root
    for (const projectRoot of possibleRoots) {
      if (projectRoot && filePath.startsWith(projectRoot)) {
        const relativePath = filePath.substring(projectRoot.length + 1);
        return relativePath;
      }
    }

    // If all strategies fail, try to extract just the src/ part
    const srcMatch = filePath.match(/.*\/(src\/.*)$/);
    if (srcMatch) {
      return srcMatch[1];
    }

    // Last resort: return the filename only
    const parts = filePath.split("/");
    return parts[parts.length - 1];
  }

  /**
   * Get colored level string for better visual distinction with proper padding
   */
  private getColoredLevel(level: LogLevelString, width: number): string {
    const levelText = `[${level.toUpperCase()}]`;

    if (!this.isDevelopment) {
      return levelText.padEnd(width);
    }

    const colors = {
      debug: "\x1b[36m", // Cyan
      info: "\x1b[32m", // Green
      warn: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
    };

    const reset = "\x1b[0m";
    const color = colors[level] || "";

    // Pad the text first, then apply colors
    const paddedText = levelText.padEnd(width);
    return `${color}${paddedText}${reset}`;
  }

  /**
   * Get colored text for different columns
   */
  private getColoredText(text: string, color: string): string {
    if (!this.isDevelopment) {
      return text;
    }

    const reset = "\x1b[0m";
    return `${color}${text}${reset}`;
  }

  /**
   * Format timestamp to EST/EDT with AM/PM
   */
  private formatTimeEST(date: Date): string {
    // Use Intl.DateTimeFormat to properly handle EST/EDT
    const options: Intl.DateTimeFormatOptions = {
      timeZone: "America/New_York", // This handles EST/EDT automatically
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      fractionalSecondDigits: 3,
    };

    const formatter = new Intl.DateTimeFormat("en-US", options);
    const parts = formatter.formatToParts(date);

    // Extract the parts
    let hour = "";
    let minute = "";
    let second = "";
    let fractionalSecond = "";
    let dayPeriod = "";

    for (const part of parts) {
      switch (part.type) {
        case "hour":
          hour = part.value;
          break;
        case "minute":
          minute = part.value;
          break;
        case "second":
          second = part.value;
          break;
        case "fractionalSecond":
          fractionalSecond = part.value;
          break;
        case "dayPeriod":
          dayPeriod = part.value;
          break;
      }
    }

    return `${hour}:${minute}:${second}.${fractionalSecond} ${dayPeriod}`;
  }

  /**
   * Print header once when logger is first used
   */
  private printHeader(): void {
    if (!Logger.headerPrinted && this.isDevelopment) {
      const LINE_WIDTH = 4;
      const MESSAGE_WIDTH = 50;
      const LEVEL_WIDTH = 7;
      const CONTEXT_WIDTH = 25;
      const FILE_WIDTH = 35;
      const TIME_WIDTH = 15;

      const lineCol = this.getColoredText(
        "LINE".padEnd(LINE_WIDTH),
        "\x1b[90m"
      ); // Gray
      const messageCol = this.getColoredText(
        "MESSAGE".padEnd(MESSAGE_WIDTH),
        "\x1b[37m"
      ); // White
      const levelCol = this.getColoredText(
        "LEVEL".padEnd(LEVEL_WIDTH),
        "\x1b[37m"
      ); // White
      const contextCol = this.getColoredText(
        "CONTEXT".padEnd(CONTEXT_WIDTH),
        "\x1b[35m"
      ); // Magenta
      const fileCol = this.getColoredText(
        "FILE:LINE".padEnd(FILE_WIDTH),
        "\x1b[34m"
      ); // Blue
      const timeCol = this.getColoredText(
        "TIME".padEnd(TIME_WIDTH),
        "\x1b[90m"
      ); // Gray

      console.log("=".repeat(130));
      console.log(
        `${lineCol} | ${messageCol} | ${levelCol} | ${contextCol} | ${fileCol} | ${timeCol}`
      );
      console.log("-".repeat(130));
      Logger.headerPrinted = true;
    }
  }

  /**
   * Format log message with consistent column widths for better readability
   */
  private formatMessage(
    level: LogLevelString,
    message: string,
    filePath?: string,
    lineNumber?: number
  ): string {
    // Print header on first log
    this.printHeader();

    const timestamp = new Date();

    // Convert to EST and format with AM/PM
    const timeStr = this.formatTimeEST(timestamp);

    // Get context string
    const contextStr = this.context || "";

    // Get file info
    let fileStr = "";
    if (this.showFileInfo) {
      if ((this as any).filePath) {
        fileStr = (this as any).filePath;
      } else if (filePath && lineNumber) {
        const formattedPath = this.formatFilePath(filePath);
        fileStr = `${formattedPath}:${lineNumber}`;
      }
    }

    // Define column widths
    const LINE_WIDTH = 4; // Line number (e.g., "  1", " 42")
    const MESSAGE_WIDTH = 50; // Message content (truncated if too long)
    const LEVEL_WIDTH = 7; // [DEBUG], [INFO ], [WARN ], [ERROR]
    const CONTEXT_WIDTH = 25; // Context name
    const FILE_WIDTH = 35; // File path and line
    const TIME_WIDTH = 15; // H:MM:SS.mmm AM/PM

    // Increment line counter
    Logger.lineCounter++;
    const logLineNumber = Logger.lineCounter.toString().padStart(LINE_WIDTH);

    // Truncate message if too long
    const truncatedMessage =
      message.length > MESSAGE_WIDTH
        ? message.substring(0, MESSAGE_WIDTH - 3) + "..."
        : message;

    // Truncate file path if too long (keep filename visible)
    const truncatedFilePath =
      fileStr.length > FILE_WIDTH
        ? "..." + fileStr.substring(fileStr.length - FILE_WIDTH + 3)
        : fileStr;

    // Format each column with padding and color coding
    const lineCol = this.getColoredText(logLineNumber, "\x1b[90m"); // Gray
    const messageCol = this.getColoredText(
      truncatedMessage.padEnd(MESSAGE_WIDTH),
      "\x1b[37m"
    ); // White
    const levelCol = this.getColoredLevel(level, LEVEL_WIDTH);
    const contextCol = this.getColoredText(
      contextStr.padEnd(CONTEXT_WIDTH),
      "\x1b[35m"
    ); // Magenta
    const fileCol = this.getColoredText(
      truncatedFilePath.padEnd(FILE_WIDTH),
      "\x1b[34m"
    ); // Blue
    const timeCol = this.getColoredText(timeStr.padEnd(TIME_WIDTH), "\x1b[90m"); // Gray

    // Format: LINE | MESSAGE | LEVEL | CONTEXT | FILE:LINE | TIME
    const metadata = [levelCol, contextCol, fileCol, timeCol]
      .filter((col) => col.trim()) // Remove empty columns
      .join(" | ");

    return `${lineCol} | ${messageCol} | ${metadata}`;
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
      console.log(""); // Add newline after each log entry
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
      console.log(formattedMessage, data || "");
      console.log(""); // Add newline after each log entry
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
      console.log(formattedMessage, data || "");
      console.log(""); // Add newline after each log entry
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
      console.log(formattedMessage, data || "");
      console.log(""); // Add newline after each log entry
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
