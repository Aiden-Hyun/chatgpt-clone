/**
 * Log levels for the centralized logging system
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export type LogLevelString = "debug" | "info" | "warn" | "error";
