import { Result } from '../../../business/shared/types/Result';

/**
 * Interface for platform-specific secure storage adapters
 * This is an internal interface not exposed to the business layer
 */
export interface ISecureStorageAdapter {
  /**
   * Store a string value securely with the given key
   * 
   * @param key The key to store the value under
   * @param value The string value to store securely
   * @returns A Result indicating success or failure
   */
  setSecureItem(key: string, value: string): Promise<Result<void>>;
  
  /**
   * Retrieve a securely stored string value for the given key
   * 
   * @param key The key to retrieve the value for
   * @returns A Result containing the value or an error
   */
  getSecureItem(key: string): Promise<Result<string | null>>;
  
  /**
   * Remove a securely stored value
   * 
   * @param key The key to remove
   * @returns A Result indicating success or failure
   */
  removeSecureItem(key: string): Promise<Result<void>>;
  
  /**
   * Check if a key exists in secure storage
   * 
   * @param key The key to check
   * @returns A Result containing a boolean indicating if the key exists
   */
  hasSecureKey(key: string): Promise<Result<boolean>>;
  
  /**
   * Check if secure storage is available on this platform
   * 
   * @returns A Result containing a boolean indicating if secure storage is available
   */
  isSecureStorageAvailable(): Promise<Result<boolean>>;
  
  /**
   * Delete all securely stored values
   * 
   * @returns A Result indicating success or failure
   */
  clearSecureStorage(): Promise<Result<void>>;
}
