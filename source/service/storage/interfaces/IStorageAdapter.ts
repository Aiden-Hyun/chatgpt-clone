import { Result } from '../../../business/shared/types/Result';

/**
 * Interface for platform-specific storage adapters
 * This is an internal interface not exposed to the business layer
 */
export interface IStorageAdapter {
  /**
   * Store a string value with the given key
   * 
   * @param key The key to store the value under
   * @param value The string value to store
   * @returns A Result indicating success or failure
   */
  setItem(key: string, value: string): Promise<Result<void>>;
  
  /**
   * Retrieve a string value for the given key
   * 
   * @param key The key to retrieve the value for
   * @returns A Result containing the value or an error
   */
  getItem(key: string): Promise<Result<string | null>>;
  
  /**
   * Remove a stored value
   * 
   * @param key The key to remove
   * @returns A Result indicating success or failure
   */
  removeItem(key: string): Promise<Result<void>>;
  
  /**
   * Check if a key exists in storage
   * 
   * @param key The key to check
   * @returns A Result containing a boolean indicating if the key exists
   */
  hasKey(key: string): Promise<Result<boolean>>;
  
  /**
   * Clear all stored values
   * 
   * @returns A Result indicating success or failure
   */
  clear(): Promise<Result<void>>;
}
