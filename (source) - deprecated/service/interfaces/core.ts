/**
 * Core Service Layer Interfaces
 * 
 * This file contains the core interfaces used throughout the service layer.
 */

// ============================================================================
// LOGGER INTERFACES
// ============================================================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  child(prefix: string): ILogger;
}

export type LogContext = Record<string, unknown>;

// ============================================================================
// ID GENERATOR INTERFACE
// ============================================================================

export interface IIdGenerator {
  generate(): string;
  generateWithPrefix(prefix: string): string;
}

// ============================================================================
// RESULT PATTERN
// ============================================================================

export interface Success<T> {
  readonly success: true;
  readonly data: T;
}

export interface Failure {
  readonly success: false;
  readonly error: string;
  readonly code?: string;
}

export type Result<T> = Success<T> | Failure;

export function createSuccess<T>(data: T): Success<T> {
  return { success: true, data };
}

export function createFailure(error: string, code?: string): Failure {
  return { success: false, error, code };
}

export function isSuccess<T>(result: Result<T>): result is Success<T> {
  return result.success === true;
}

export function isFailure<T>(result: Result<T>): result is Failure {
  return result.success === false;
}
