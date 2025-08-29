/**
 * Storage Service Types
 * 
 * Types for storage operations in the service layer.
 */

import { Result } from '../../../business/types/shared/Result';

/**
 * Storage operation result
 */
export type StorageResult<T> = Result<T>;

/**
 * Storage adapter interface for platform-specific implementations
 */
export interface IStorageAdapter {
  setItem(key: string, value: string): Promise<StorageResult<void>>;
  getItem(key: string): Promise<StorageResult<string | null>>;
  removeItem(key: string): Promise<StorageResult<void>>;
  hasKey(key: string): Promise<StorageResult<boolean>>;
  clear(): Promise<StorageResult<void>>;
}

/**
 * Secure storage adapter interface
 */
export interface ISecureStorageAdapter extends IStorageAdapter {
  isSecureStorageAvailable(): Promise<StorageResult<boolean>>;
  migrateFromInsecureStorage(key: string): Promise<StorageResult<void>>;
}

/**
 * Storage configuration
 */
export interface StorageConfig {
  enableEncryption: boolean;
  keyPrefix: string;
  maxRetries: number;
  retryDelay: number;
}

/**
 * Storage operation types
 */
export enum StorageOperation {
  GET = 'get',
  SET = 'set',
  REMOVE = 'remove',
  CLEAR = 'clear',
  HAS_KEY = 'has_key'
}

/**
 * Storage metrics
 */
export interface StorageMetrics {
  operation: StorageOperation;
  key: string;
  success: boolean;
  duration: number;
  error?: string;
}
