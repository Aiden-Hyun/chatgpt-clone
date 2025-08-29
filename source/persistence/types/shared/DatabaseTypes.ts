/**
 * Database Types
 * 
 * Common database-related types for the persistence layer.
 */

import { Result } from '../../../business/types/shared/Result';

/**
 * Database operation result
 */
export type DatabaseResult<T> = Result<T>;

/**
 * Database connection configuration
 */
export interface DatabaseConfig {
  url: string;
  apiKey: string;
  timeout: number;
  retries: number;
  enableLogging: boolean;
}

/**
 * Database query options
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

/**
 * Database transaction interface
 */
export interface DatabaseTransaction {
  commit(): Promise<DatabaseResult<void>>;
  rollback(): Promise<DatabaseResult<void>>;
}

/**
 * Database error types
 */
export enum DatabaseErrorType {
  CONNECTION_ERROR = 'connection_error',
  QUERY_ERROR = 'query_error',
  CONSTRAINT_VIOLATION = 'constraint_violation',
  NOT_FOUND = 'not_found',
  DUPLICATE_KEY = 'duplicate_key',
  TIMEOUT = 'timeout',
  PERMISSION_DENIED = 'permission_denied',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Database error interface
 */
export interface DatabaseError {
  type: DatabaseErrorType;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Pagination result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
