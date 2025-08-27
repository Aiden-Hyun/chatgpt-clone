import { Platform } from 'react-native';
import { Result } from '../../../business/shared/types/Result';
import { StorageKey } from '../../../business/storage/constants';
import { IStorageService } from '../../../business/storage/interfaces/IStorageService';
import { ILogger } from '../../shared/interfaces/ILogger';
import { IStorageAdapter } from '../interfaces/IStorageAdapter';
import { AsyncStorageAdapter } from './AsyncStorageAdapter';
import { WebStorageAdapter, WebStorageType } from './WebStorageAdapter';

/**
 * Implementation of the IStorageService interface
 * Uses the appropriate storage adapter based on platform
 */
export class MobileStorageService implements IStorageService {
  private readonly logger: ILogger;
  private readonly adapter: IStorageAdapter;
  
  /**
   * Create a new MobileStorageService
   * 
   * @param logger The logger to use
   */
  constructor(logger: ILogger) {
    this.logger = logger;
    
    // Select the appropriate adapter based on platform
    if (Platform.OS === 'web') {
      this.adapter = new WebStorageAdapter(logger, WebStorageType.SESSION);
      this.logger.debug('MobileStorageService: Using WebStorageAdapter with sessionStorage');
    } else {
      this.adapter = new AsyncStorageAdapter(logger);
      this.logger.debug('MobileStorageService: Using AsyncStorageAdapter');
    }
  }
  
  /**
   * Store a string value with the given key
   * 
   * @param key The key to store the value under
   * @param value The string value to store
   * @returns A Result indicating success or failure
   */
  async setItem(key: StorageKey | string, value: string): Promise<Result<void>> {
    return await this.adapter.setItem(key, value);
  }
  
  /**
   * Retrieve a string value for the given key
   * 
   * @param key The key to retrieve the value for
   * @returns A Result containing the value or an error
   */
  async getItem(key: StorageKey | string): Promise<Result<string | null>> {
    return await this.adapter.getItem(key);
  }
  
  /**
   * Remove a stored value
   * 
   * @param key The key to remove
   * @returns A Result indicating success or failure
   */
  async removeItem(key: StorageKey | string): Promise<Result<void>> {
    return await this.adapter.removeItem(key);
  }
  
  /**
   * Store an object value with the given key (serialized as JSON)
   * 
   * @param key The key to store the value under
   * @param value The object value to store
   * @returns A Result indicating success or failure
   */
  async setObject<T>(key: StorageKey | string, value: T): Promise<Result<void>> {
    try {
      const jsonValue = JSON.stringify(value);
      return await this.setItem(key, jsonValue);
    } catch (error) {
      this.logger.error('MobileStorageService: Failed to serialize object', { key, error });
      return { success: false, error: `Failed to serialize object: ${error}` };
    }
  }
  
  /**
   * Retrieve an object value for the given key (deserialized from JSON)
   * 
   * @param key The key to retrieve the value for
   * @returns A Result containing the value or an error
   */
  async getObject<T>(key: StorageKey | string): Promise<Result<T | null>> {
    const result = await this.getItem(key);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    const value = result.data;
    
    if (value === null) {
      return { success: true, data: null };
    }
    
    try {
      const parsedValue = JSON.parse(value) as T;
      return { success: true, data: parsedValue };
    } catch (error) {
      this.logger.error('MobileStorageService: Failed to parse stored JSON', { key, error });
      return { success: false, error: `Failed to parse stored JSON: ${error}` };
    }
  }
  
  /**
   * Check if a key exists in storage
   * 
   * @param key The key to check
   * @returns A Result containing a boolean indicating if the key exists
   */
  async hasKey(key: StorageKey | string): Promise<Result<boolean>> {
    return await this.adapter.hasKey(key);
  }
  
  /**
   * Clear all stored values
   * 
   * @returns A Result indicating success or failure
   */
  async clear(): Promise<Result<void>> {
    return await this.adapter.clear();
  }
}
