import { StorageKey } from '../../../business/storage/constants';
import { ISecureStorageService } from '../../../business/storage/interfaces/ISecureStorageService';
import { Result } from '../../../business/types/shared/Result';
import { ILogger } from '../../shared/interfaces/ILogger';
import { ISecureStorageAdapter } from '../interfaces/ISecureStorageAdapter';
import { SecureStoreAdapter } from './SecureStoreAdapter';

/**
 * Implementation of the ISecureStorageService interface
 */
export class SecureStorageService implements ISecureStorageService {
  private readonly logger: ILogger;
  private readonly adapter: ISecureStorageAdapter;
  
  /**
   * Create a new SecureStorageService
   * 
   * @param logger The logger to use
   */
  constructor(logger: ILogger) {
    this.logger = logger;
    this.adapter = new SecureStoreAdapter(logger);
    
    // Check if secure storage is available
    this.isSecureStorageAvailable().then(result => {
      if (result.success && result.data) {
        this.logger.debug('SecureStorageService: Secure storage is available');
      } else {
        this.logger.warn('SecureStorageService: Secure storage is not available on this platform');
      }
    });
  }
  
  /**
   * Store a string value securely with the given key
   * 
   * @param key The key to store the value under
   * @param value The string value to store securely
   * @returns A Result indicating success or failure
   */
  async setSecureItem(key: StorageKey | string, value: string): Promise<Result<void>> {
    return await this.adapter.setSecureItem(key, value);
  }
  
  /**
   * Retrieve a securely stored string value for the given key
   * 
   * @param key The key to retrieve the value for
   * @returns A Result containing the value or an error
   */
  async getSecureItem(key: StorageKey | string): Promise<Result<string | null>> {
    return await this.adapter.getSecureItem(key);
  }
  
  /**
   * Remove a securely stored value
   * 
   * @param key The key to remove
   * @returns A Result indicating success or failure
   */
  async removeSecureItem(key: StorageKey | string): Promise<Result<void>> {
    return await this.adapter.removeSecureItem(key);
  }
  
  /**
   * Store an object value securely with the given key (serialized as JSON)
   * 
   * @param key The key to store the value under
   * @param value The object value to store securely
   * @returns A Result indicating success or failure
   */
  async setSecureObject<T>(key: StorageKey | string, value: T): Promise<Result<void>> {
    try {
      const jsonValue = JSON.stringify(value);
      return await this.setSecureItem(key, jsonValue);
    } catch (error) {
      this.logger.error('SecureStorageService: Failed to serialize object', { key, error });
      return { success: false, error: `Failed to serialize object: ${error}` };
    }
  }
  
  /**
   * Retrieve a securely stored object value for the given key (deserialized from JSON)
   * 
   * @param key The key to retrieve the value for
   * @returns A Result containing the value or an error
   */
  async getSecureObject<T>(key: StorageKey | string): Promise<Result<T | null>> {
    const result = await this.getSecureItem(key);
    
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
      this.logger.error('SecureStorageService: Failed to parse stored JSON', { key, error });
      return { success: false, error: `Failed to parse stored JSON: ${error}` };
    }
  }
  
  /**
   * Check if a key exists in secure storage
   * 
   * @param key The key to check
   * @returns A Result containing a boolean indicating if the key exists
   */
  async hasSecureKey(key: StorageKey | string): Promise<Result<boolean>> {
    return await this.adapter.hasSecureKey(key);
  }
  
  /**
   * Check if secure storage is available on this platform
   * 
   * @returns A Result containing a boolean indicating if secure storage is available
   */
  async isSecureStorageAvailable(): Promise<Result<boolean>> {
    return await this.adapter.isSecureStorageAvailable();
  }
  
  /**
   * Delete all securely stored values
   * 
   * @returns A Result indicating success or failure
   */
  async clearSecureStorage(): Promise<Result<void>> {
    return await this.adapter.clearSecureStorage();
  }
}
