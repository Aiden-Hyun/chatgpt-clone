/**
 * Storage Service Layer Interfaces
 * 
 * This file contains storage-related interfaces used in the service layer.
 */

import { Result } from './core';

// ============================================================================
// STORAGE TYPES AND ENUMS
// ============================================================================

export type StorageKey = string;

export enum WebStorageType {
  LOCAL = 'local',
  SESSION = 'session',
}

// ============================================================================
// STORAGE SERVICE INTERFACES
// ============================================================================

export interface IStorageService {
  get<T>(key: StorageKey): Promise<Result<T>>;
  set<T>(key: StorageKey, value: T): Promise<Result<void>>;
  remove(key: StorageKey): Promise<Result<void>>;
  clear(): Promise<Result<void>>;
  has(key: StorageKey): Promise<Result<boolean>>;
}

export interface ISecureStorageService {
  get<T>(key: StorageKey): Promise<Result<T>>;
  set<T>(key: StorageKey, value: T): Promise<Result<void>>;
  remove(key: StorageKey): Promise<Result<void>>;
  clear(): Promise<Result<void>>;
  has(key: StorageKey): Promise<Result<boolean>>;
}

// ============================================================================
// STORAGE ADAPTER INTERFACES
// ============================================================================

export interface IStorageAdapter {
  setItem(key: StorageKey, value: string): Promise<Result<void>>;
  getItem(key: StorageKey): Promise<Result<string | null>>;
  removeItem(key: StorageKey): Promise<Result<void>>;
  hasKey(key: StorageKey): Promise<Result<boolean>>;
  clear(): Promise<Result<void>>;
}

export interface ISecureStorageAdapter {
  get<T>(key: StorageKey): Promise<Result<T>>;
  set<T>(key: StorageKey, value: T): Promise<Result<void>>;
  remove(key: StorageKey): Promise<Result<void>>;
  clear(): Promise<Result<void>>;
  has(key: StorageKey): Promise<Result<boolean>>;
}
