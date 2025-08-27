import { Result } from '../../shared/types/Result';
import { StorageKey } from '../constants';

/**
 * Interface for general storage operations
 * Provides methods for storing, retrieving, and removing data
 */
export interface IStorageService {
  /**
   * Store a string value with the given key
   * 
   * @param key The key to store the value under
   * @param value The string value to store
   * @returns A Result indicating success or failure
   */
  setItem(key: StorageKey | string, value: string): Promise<Result<void>>;
  
  /**
   * Retrieve a string value for the given key
   * 
   * @param key The key to retrieve the value for
   * @returns A Result containing the value or an error
   */
  getItem(key: StorageKey | string): Promise<Result<string | null>>;
  
  /**
   * Remove a stored value
   * 
   * @param key The key to remove
   * @returns A Result indicating success or failure
   */
  removeItem(key: StorageKey | string): Promise<Result<void>>;
  
  /**
   * Store an object value with the given key (serialized as JSON)
   * 
   * @param key The key to store the value under
   * @param value The object value to store
   * @returns A Result indicating success or failure
   */
  setObject<T>(key: StorageKey | string, value: T): Promise<Result<void>>;
  
  /**
   * Retrieve an object value for the given key (deserialized from JSON)
   * 
   * @param key The key to retrieve the value for
   * @returns A Result containing the value or an error
   */
  getObject<T>(key: StorageKey | string): Promise<Result<T | null>>;
  
  /**
   * Check if a key exists in storage
   * 
   * @param key The key to check
   * @returns A Result containing a boolean indicating if the key exists
   */
  hasKey(key: StorageKey | string): Promise<Result<boolean>>;
  
  /**
   * Clear all stored values
   * 
   * @returns A Result indicating success or failure
   */
  clear(): Promise<Result<void>>;
}
