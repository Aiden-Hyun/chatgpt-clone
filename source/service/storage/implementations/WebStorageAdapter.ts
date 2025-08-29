import { Result } from '../../../business/types/shared/Result';
import { ILogger } from '../../shared/interfaces/ILogger';
import { IStorageAdapter } from '../interfaces/IStorageAdapter';

/**
 * Type of web storage to use
 */
export enum WebStorageType {
  LOCAL = 'local',
  SESSION = 'session',
}

/**
 * Implementation of the IStorageAdapter interface using Web Storage
 */
export class WebStorageAdapter implements IStorageAdapter {
  private readonly logger: ILogger;
  private readonly storageType: WebStorageType;
  private readonly storage: Storage;
  
  /**
   * Create a new WebStorageAdapter
   * 
   * @param logger The logger to use
   * @param storageType The type of web storage to use (local or session)
   */
  constructor(logger: ILogger, storageType: WebStorageType = WebStorageType.LOCAL) {
    this.logger = logger;
    this.storageType = storageType;
    
    // Select the appropriate storage based on the type
    if (typeof window !== 'undefined') {
      this.storage = storageType === WebStorageType.LOCAL
        ? window.localStorage
        : window.sessionStorage;
    } else {
      // Create a mock storage for SSR environments
      this.storage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        length: 0,
        key: () => null,
      };
      this.logger.warn('WebStorage: Running in a non-browser environment, using mock storage');
    }
  }
  
  /**
   * Store a string value with the given key
   * 
   * @param key The key to store the value under
   * @param value The string value to store
   * @returns A Result indicating success or failure
   */
  async setItem(key: string, value: string): Promise<Result<void>> {
    try {
      this.storage.setItem(key, value);
      this.logger.debug('WebStorage: Item set successfully', { key, storageType: this.storageType });
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('WebStorage: Failed to set item', { key, storageType: this.storageType, error });
      return { success: false, error: `Failed to set item: ${error}` };
    }
  }
  
  /**
   * Retrieve a string value for the given key
   * 
   * @param key The key to retrieve the value for
   * @returns A Result containing the value or an error
   */
  async getItem(key: string): Promise<Result<string | null>> {
    try {
      const value = this.storage.getItem(key);
      this.logger.debug('WebStorage: Item retrieved', { key, storageType: this.storageType, found: value !== null });
      return { success: true, data: value };
    } catch (error) {
      this.logger.error('WebStorage: Failed to get item', { key, storageType: this.storageType, error });
      return { success: false, error: `Failed to get item: ${error}` };
    }
  }
  
  /**
   * Remove a stored value
   * 
   * @param key The key to remove
   * @returns A Result indicating success or failure
   */
  async removeItem(key: string): Promise<Result<void>> {
    try {
      this.storage.removeItem(key);
      this.logger.debug('WebStorage: Item removed', { key, storageType: this.storageType });
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('WebStorage: Failed to remove item', { key, storageType: this.storageType, error });
      return { success: false, error: `Failed to remove item: ${error}` };
    }
  }
  
  /**
   * Check if a key exists in storage
   * 
   * @param key The key to check
   * @returns A Result containing a boolean indicating if the key exists
   */
  async hasKey(key: string): Promise<Result<boolean>> {
    try {
      const value = this.storage.getItem(key);
      const exists = value !== null;
      this.logger.debug('WebStorage: Checked if key exists', { key, storageType: this.storageType, exists });
      return { success: true, data: exists };
    } catch (error) {
      this.logger.error('WebStorage: Failed to check if key exists', { key, storageType: this.storageType, error });
      return { success: false, error: `Failed to check if key exists: ${error}` };
    }
  }
  
  /**
   * Clear all stored values
   * 
   * @returns A Result indicating success or failure
   */
  async clear(): Promise<Result<void>> {
    try {
      this.storage.clear();
      this.logger.debug('WebStorage: All items cleared', { storageType: this.storageType });
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('WebStorage: Failed to clear all items', { storageType: this.storageType, error });
      return { success: false, error: `Failed to clear all items: ${error}` };
    }
  }
}
