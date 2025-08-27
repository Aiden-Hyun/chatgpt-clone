// Service layer interface for logging
export interface LogContext {
  [key: string]: any;
}

export interface ILogger {
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
  child(prefix: string): ILogger;
}
