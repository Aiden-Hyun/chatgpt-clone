import AsyncStorage from '@react-native-async-storage/async-storage';
import { Result } from '../../../business/types/shared/Result';
import { ILogger } from '../../shared/interfaces/ILogger';
import { IStorageAdapter } from '../interfaces/IStorageAdapter';

/**
 * Implementation of the IStorageAdapter interface using AsyncStorage
 */
export class AsyncStorageAdapter implements IStorageAdapter {
  private readonly logger: ILogger;
  
  /**
   * Create a new AsyncStorageAdapter
   * 
   * @param logger The logger to use
   */
  constructor(logger: ILogger) {
    this.logger = logger;
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
      await AsyncStorage.setItem(key, value);
      this.logger.debug('AsyncStorage: Item set successfully', { key });
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('AsyncStorage: Failed to set item', { key, error });
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
      const value = await AsyncStorage.getItem(key);
      this.logger.debug('AsyncStorage: Item retrieved', { key, found: value !== null });
      return { success: true, data: value };
    } catch (error) {
      this.logger.error('AsyncStorage: Failed to get item', { key, error });
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
      await AsyncStorage.removeItem(key);
      this.logger.debug('AsyncStorage: Item removed', { key });
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('AsyncStorage: Failed to remove item', { key, error });
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
      const value = await AsyncStorage.getItem(key);
      const exists = value !== null;
      this.logger.debug('AsyncStorage: Checked if key exists', { key, exists });
      return { success: true, data: exists };
    } catch (error) {
      this.logger.error('AsyncStorage: Failed to check if key exists', { key, error });
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
      await AsyncStorage.clear();
      this.logger.debug('AsyncStorage: All items cleared');
      return { success: true, data: undefined };
    } catch (error) {
      this.logger.error('AsyncStorage: Failed to clear all items', { error });
      return { success: false, error: `Failed to clear all items: ${error}` };
    }
  }
}
