/**
 * Service Layer Logger Types
 * 
 * Types related to logging in the service layer.
 */

/**
 * Log levels supported by the logger
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log entry structure
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  metadata?: Record<string, unknown>;
  error?: Error;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  context?: string;
}

/**
 * Logger interface for service implementations
 */
export interface IServiceLogger {
  debug(message: string, metadata?: Record<string, unknown>): void;
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void;
  child(context: string): IServiceLogger;
}

/**
 * Log transport interface for different output methods
 */
export interface ILogTransport {
  log(entry: LogEntry): Promise<void>;
  flush(): Promise<void>;
}

/**
 * Performance measurement types
 */
export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  operation: string;
  metadata?: Record<string, unknown>;
}
