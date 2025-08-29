import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Result } from '../../../business/types/shared/Result';
import { ILogger } from '../../shared/interfaces/ILogger';
import { ISecureStorageAdapter } from '../interfaces/ISecureStorageAdapter';

/**
 * Implementation of the ISecureStorageAdapter interface using Expo SecureStore
 */
export class SecureStoreAdapter implements ISecureStorageAdapter {
  private readonly logger: ILogger;
  private readonly isAvailable: boolean;
  
  /**
   * Create a new SecureStoreAdapter
   * 
   * @param logger The logger to use
   */
  constructor(logger: ILogger) {
    this.logger = logger;
    // SecureStore is only available on iOS and Android
    this.isAvailable = Platform.OS === 'ios' || Platform.OS === 'android';
    
    if (!this.isAvailable) {
      this.logger.warn('SecureStore: Not available on this platform', { platform: Platform.OS });
    }
  }
  
  /**
   * Store a string value securely with the given key
   * 
   * @param key The key to store the value under
   * @param value The string value to store securely
   * @returns A Result indicating success or failure
   */
  async setSecureItem(key: string, value: string): Promise<Result<void>> {
    if (!this.isAvailable) {
      this.logger.warn('SecureStore: Not available on this platform', { platform: Platform.OS });
      return { success: false, error: 'Secure storage is not available on this platform' };
    }
    
    try {
      await SecureStore.setItemAsync(key, value);
      this.logger.debug('SecureStore: Item set successfully', { key });
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('SecureStore: Failed to set item', { key, error });
      return { success: false, error: `Failed to set secure item: ${error}` };
    }
  }
  
  /**
   * Retrieve a securely stored string value for the given key
   * 
   * @param key The key to retrieve the value for
   * @returns A Result containing the value or an error
   */
  async getSecureItem(key: string): Promise<Result<string | null>> {
    if (!this.isAvailable) {
      this.logger.warn('SecureStore: Not available on this platform', { platform: Platform.OS });
      return { success: false, error: 'Secure storage is not available on this platform' };
    }
    
    try {
      const value = await SecureStore.getItemAsync(key);
      this.logger.debug('SecureStore: Item retrieved', { key, found: value !== null });
      return { success: true, data: value };
    } catch (error) {
      this.logger.error('SecureStore: Failed to get item', { key, error });
      return { success: false, error: `Failed to get secure item: ${error}` };
    }
  }
  
  /**
   * Remove a securely stored value
   * 
   * @param key The key to remove
   * @returns A Result indicating success or failure
   */
  async removeSecureItem(key: string): Promise<Result<void>> {
    if (!this.isAvailable) {
      this.logger.warn('SecureStore: Not available on this platform', { platform: Platform.OS });
      return { success: false, error: 'Secure storage is not available on this platform' };
    }
    
    try {
      await SecureStore.deleteItemAsync(key);
      this.logger.debug('SecureStore: Item removed', { key });
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('SecureStore: Failed to remove item', { key, error });
      return { success: false, error: `Failed to remove secure item: ${error}` };
    }
  }
  
  /**
   * Check if a key exists in secure storage
   * 
   * @param key The key to check
   * @returns A Result containing a boolean indicating if the key exists
   */
  async hasSecureKey(key: string): Promise<Result<boolean>> {
    if (!this.isAvailable) {
      this.logger.warn('SecureStore: Not available on this platform', { platform: Platform.OS });
      return { success: false, error: 'Secure storage is not available on this platform' };
    }
    
    try {
      const value = await SecureStore.getItemAsync(key);
      const exists = value !== null;
      this.logger.debug('SecureStore: Checked if key exists', { key, exists });
      return { success: true, data: exists };
    } catch (error) {
      this.logger.error('SecureStore: Failed to check if key exists', { key, error });
      return { success: false, error: `Failed to check if secure key exists: ${error}` };
    }
  }
  
  /**
   * Check if secure storage is available on this platform
   * 
   * @returns A Result containing a boolean indicating if secure storage is available
   */
  async isSecureStorageAvailable(): Promise<Result<boolean>> {
    this.logger.debug('SecureStore: Checking availability', { available: this.isAvailable });
    return { success: true, data: this.isAvailable };
  }
  
  /**
   * Delete all securely stored values
   * Note: SecureStore doesn't provide a native method to clear all items,
   * so this is not implemented and will return an error
   * 
   * @returns A Result indicating success or failure
   */
  async clearSecureStorage(): Promise<Result<void>> {
    this.logger.error('SecureStore: Clear all items is not supported');
    return { 
      success: false, 
      error: 'Clearing all secure items is not supported by SecureStore. You must remove items individually.' 
    };
  }
}
