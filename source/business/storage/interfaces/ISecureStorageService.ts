import { Result } from '../../shared/types/Result';
import { StorageKey } from '../constants';

/**
 * Interface for secure storage operations
 * Provides methods for storing, retrieving, and removing encrypted data
 */
export interface ISecureStorageService {
  /**
   * Store a string value securely with the given key
   * 
   * @param key The key to store the value under
   * @param value The string value to store securely
   * @returns A Result indicating success or failure
   */
  setSecureItem(key: StorageKey | string, value: string): Promise<Result<void>>;
  
  /**
   * Retrieve a securely stored string value for the given key
   * 
   * @param key The key to retrieve the value for
   * @returns A Result containing the value or an error
   */
  getSecureItem(key: StorageKey | string): Promise<Result<string | null>>;
  
  /**
   * Remove a securely stored value
   * 
   * @param key The key to remove
   * @returns A Result indicating success or failure
   */
  removeSecureItem(key: StorageKey | string): Promise<Result<void>>;
  
  /**
   * Store an object value securely with the given key (serialized as JSON)
   * 
   * @param key The key to store the value under
   * @param value The object value to store securely
   * @returns A Result indicating success or failure
   */
  setSecureObject<T>(key: StorageKey | string, value: T): Promise<Result<void>>;
  
  /**
   * Retrieve a securely stored object value for the given key (deserialized from JSON)
   * 
   * @param key The key to retrieve the value for
   * @returns A Result containing the value or an error
   */
  getSecureObject<T>(key: StorageKey | string): Promise<Result<T | null>>;
  
  /**
   * Check if a key exists in secure storage
   * 
   * @param key The key to check
   * @returns A Result containing a boolean indicating if the key exists
   */
  hasSecureKey(key: StorageKey | string): Promise<Result<boolean>>;
  
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
