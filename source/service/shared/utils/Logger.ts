import { ILogger, LogContext, LogLevel } from '../../interfaces';

export class Logger implements ILogger {
  private static currentLevel: LogLevel = LogLevel.INFO;
  private static isDevelopment = __DEV__;

  static setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  // Instance methods that implement ILogger interface
  debug(message: string, context?: LogContext): void {
    if (Logger.shouldLog(LogLevel.DEBUG)) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  }

  info(message: string, context?: LogContext): void {
    if (Logger.shouldLog(LogLevel.INFO)) {
      console.log(`[INFO] ${message}`, context || '');
    }
  }

  warn(message: string, context?: LogContext): void {
    if (Logger.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${message}`, context || '');
    }
  }

  error(message: string, context?: LogContext): void {
    if (Logger.shouldLog(LogLevel.ERROR)) {
      console.error(`[ERROR] ${message}`, context || '');
    }
  }

  child(prefix: string): ILogger {
    return new ChildLogger(prefix);
  }

  // Static methods for convenience (backwards compatibility)
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

  public static shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel || this.isDevelopment;
  }

  static createChildLogger(prefix: string): Logger {
    return new ChildLogger(prefix);
  }
}

class ChildLogger implements ILogger {
  constructor(private prefix: string) {}

  debug(message: string, context?: LogContext): void {
    if (Logger.shouldLog(LogLevel.DEBUG)) {
      console.log(`[DEBUG] [${this.prefix}] ${message}`, context || '');
    }
  }

  info(message: string, context?: LogContext): void {
    if (Logger.shouldLog(LogLevel.INFO)) {
      console.log(`[INFO] [${this.prefix}] ${message}`, context || '');
    }
  }

  warn(message: string, context?: LogContext): void {
    if (Logger.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] [${this.prefix}] ${message}`, context || '');
    }
  }

  error(message: string, context?: LogContext): void {
    if (Logger.shouldLog(LogLevel.ERROR)) {
      console.error(`[ERROR] [${this.prefix}] ${message}`, context || '');
    }
  }

  child(prefix: string): ILogger {
    return new ChildLogger(`${this.prefix}:${prefix}`);
  }
}
