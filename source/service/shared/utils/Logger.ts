import { ILogger, LogContext } from '../interfaces/ILogger';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger implements ILogger {
  private static currentLevel: LogLevel = LogLevel.INFO;
  private static isDevelopment = __DEV__;

  static setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  static debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  }

  static info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(`[INFO] ${message}`, context || '');
    }
  }

  static warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${message}`, context || '');
    }
  }

  static error(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[ERROR] ${message}`, context || '');
    }
  }

  static logAuthEvent(event: string, userId?: string, context?: LogContext): void {
    this.info(`Auth Event: ${event}`, {
      userId,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  static logUserAction(action: string, userId?: string, context?: LogContext): void {
    this.info(`User Action: ${action}`, {
      userId,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  static logError(error: Error, context?: LogContext): void {
    this.error(error.message, {
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  private static shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel || this.isDevelopment;
  }

  static createChildLogger(prefix: string): Logger {
    return new ChildLogger(prefix);
  }
}

class ChildLogger extends Logger {
  constructor(private prefix: string) {
    super();
  }

  debug(message: string, context?: LogContext): void {
    super.debug(`[${this.prefix}] ${message}`, context);
  }

  info(message: string, context?: LogContext): void {
    super.info(`[${this.prefix}] ${message}`, context);
  }

  warn(message: string, context?: LogContext): void {
    super.warn(`[${this.prefix}] ${message}`, context);
  }

  error(message: string, context?: LogContext): void {
    super.error(`[${this.prefix}] ${message}`, context);
  }
}
