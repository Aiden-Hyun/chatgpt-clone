// Shared interfaces and types for persistence layer

// Session adapter interfaces
export interface SessionValidationResult {
  isValid: boolean;
  error?: string;
}

export interface IUserSession {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  isValid(): boolean;
  isExpired(): boolean;
  validate(): SessionValidationResult;
}

export interface IUserSessionFactory {
  create(sessionData: unknown): IUserSession;
  isValidSession(sessionData: unknown): boolean;
}

export interface ISessionAdapter {
  getSession(): Promise<{ success: boolean; session?: IUserSession; error?: string }>;
  setSession(session: IUserSession): Promise<{ success: boolean; error?: string }>;
  clearSession(): Promise<{ success: boolean; error?: string }>;
  validateSession(session: unknown): SessionValidationResult;
}

// Session mapper interface
export interface ISharedSessionMapper {
  toEntity(dbSession: unknown): IUserSession;
  toDatabase(session: IUserSession): unknown;
  isValidSessionData(data: unknown): boolean;
}

// Storage adapter interface
export interface IStorageAdapter {
  get(key: string): Promise<{ success: boolean; value?: string; error?: string }>;
  set(key: string, value: string): Promise<{ success: boolean; error?: string }>;
  remove(key: string): Promise<{ success: boolean; error?: string }>;
  clear(): Promise<{ success: boolean; error?: string }>;
}

// Logger interface
export interface ILogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

// Common result types
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function createSuccess<T>(data: T): Result<T> {
  return { success: true, data };
}

export function createFailure<T>(error: string): Result<T> {
  return { success: false, error };
}

export function isFailure<T>(result: Result<T>): boolean {
  return !result.success;
}

export interface PaginatedResult<T> {
  success: boolean;
  data?: T[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Session validation error types
export enum SessionValidationError {
  UNKNOWN = 'UNKNOWN',
  EXPIRED = 'EXPIRED',
  INVALID_FORMAT = 'INVALID_FORMAT',
  MISSING_FIELDS = 'MISSING_FIELDS',
  INVALID_TOKEN = 'INVALID_TOKEN',
}

// Session result type
export type SessionResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  errorType?: SessionValidationError;
};

// Session result helper functions
export function createSessionSuccess<T>(data: T): SessionResult<T> {
  return { success: true, data };
}

export function createSessionFailure<T>(error: string, errorType?: SessionValidationError): SessionResult<T> {
  return { success: false, error, errorType };
}

// Session expiry thresholds
export const SESSION_EXPIRY_THRESHOLDS = {
  WARNING: 5 * 60 * 1000, // 5 minutes
  CRITICAL: 1 * 60 * 1000, // 1 minute
  EXPIRED: 0,
} as const;

// Common error types
export enum PersistenceError {
  NETWORK_ERROR = 'NETWORK_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface PersistenceErrorResult {
  error: PersistenceError;
  message: string;
  details?: unknown;
}

// Common configuration types
export interface DatabaseConfig {
  url: string;
  apiKey: string;
  options?: Record<string, unknown>;
}

export interface StorageConfig {
  type: 'local' | 'secure' | 'remote';
  options?: Record<string, unknown>;
}

// Common validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean;
}
